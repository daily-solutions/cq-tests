import * as jwt from 'jsonwebtoken';
import uuid4 from 'uuid4';
import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

const DEFAULT_SIMULCAST = [
  {
    scaleResolutionDownBy: 1,
    maxBitrate: 680,
    maxFramerate: 30,
  },
  { scaleResolutionDownBy: 2, maxBitrate: 200, maxFramerate: 15 },
  { scaleResolutionDownBy: 4, maxBitrate: 80, maxFramerate: 10 },
];

export const getSimulcastLayers = (config) => {
  if (!config.enableSimulcast) return false;

  let simulcast = DEFAULT_SIMULCAST;
  if (config.customSimulcast) {
    simulcast = config.customSimulcast
      .sort((a, b) => b.downscale - a.downscale)
      .map((ss) => ({
        maxBitrate: ss.bitrate * 1000,
        maxFramerate: ss.frameRate,
        scaleResolutionDownBy: ss.downscale,
      }));
  }

  return {
    video: {
      layers: [
        {
          rid: 'f',
          ...simulcast[0],
        },
        {
          rid: 'h',
          ...simulcast[1],
        },
        {
          rid: 'q',
          ...simulcast[2],
        },
      ],
    },
  };
};

export const encryptKeys = async (config) => {
  const encryptedAppAccessKey = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.appAccessKey
  );
  const encryptedAppSecret = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.appSecret
  );
  return {
    appAccessKey: encryptedAppAccessKey,
    appSecret: encryptedAppSecret,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedApiAccessKey = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.appAccessKey
  );
  const decryptedApiSecret = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.appSecret
  );

  return {
    apiAccessKey: decryptedApiAccessKey,
    apiSecret: decryptedApiSecret,
  };
};

const createManagementToken = (accessKey, secret) => {
  try {
    return jwt.sign(
      {
        access_key: accessKey,
        type: 'management',
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
      },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: '24h',
        jwtid: uuid4(),
      }
    );
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`failed to create management token: ${e.toString()}`);
    }
    throw new Error(`failed to create management token: ${e}`);
  }
};

const createTemplate = async (config, token) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: uuid4(),
      default: false,
      roles: {
        guest: {
          name: 'guest',
          publishParams: {
            allowed: ['audio', 'video', 'screen'],
            audio: {
              bitRate: 32,
              codec: 'opus',
            },
            video: {
              bitRate: 850,
              codec: 'vp8',
              frameRate: 30,
              width: config.videoConstraints.width,
              height: config.videoConstraints.height,
            },
            screen: {
              codec: 'vp8',
              frameRate: 10,
              width: 1920,
              height: 1080,
            },
            simulcast: getSimulcastLayers(config),
            videoSimulcastLayers: {},
            screenSimulcastLayers: {},
          },
          subscribeParams: {
            subscribeToRoles: config?.ils ? ['host'] : ['host', 'guest'],
            maxSubsBitRate: 3200,
            subscribeDegradation: {
              packetLossThreshold: 25,
              degradeGracePeriodSeconds: 1,
              recoverGracePeriodSeconds: 4,
            },
          },
          permissions: {
            sendRoomState: true,
          },
          priority: 1,
          maxPeerCount: 0,
        },
        host: {
          name: 'host',
          publishParams: {
            allowed: ['audio', 'video', 'screen'],
            audio: {
              bitRate: 32,
              codec: 'opus',
            },
            video: {
              bitRate: 850,
              codec: 'vp8',
              frameRate: 30,
              width: config.videoConstraints.width,
              height: config.videoConstraints.height,
            },
            screen: {
              codec: 'vp8',
              frameRate: 10,
              width: 1920,
              height: 1080,
            },
            simulcast: getSimulcastLayers(config),
            videoSimulcastLayers: {},
            screenSimulcastLayers: {},
          },
          subscribeParams: {
            subscribeToRoles: config?.ils ? ['host'] : ['host', 'guest'],
            maxSubsBitRate: 3200,
            subscribeDegradation: {
              packetLossThreshold: 25,
              degradeGracePeriodSeconds: 1,
              recoverGracePeriodSeconds: 4,
            },
          },
          permissions: {
            sendRoomState: true,
          },
          priority: 1,
          maxPeerCount: 0,
        },
      },
      settings: {
        region: 'auto',
        screenSimulcastLayers: {},
        videoSimulcastLayers: {},
      },
    }),
  };
  const templateRes = await fetch(
    'https://api.100ms.live/v2/templates',
    options
  );
  return await templateRes.json();
};

export const createRoom = async (profile, config) => {
  const { apiAccessKey, apiSecret } = await decryptKeys(profile);
  const managementToken = createManagementToken(apiAccessKey, apiSecret);
  const template = await createTemplate(config, managementToken);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managementToken}`,
    },
    body: JSON.stringify({
      template_id: template.id,
      region: config.region ?? 'auto',
    }),
  };
  const res = await fetch('https://api.100ms.live/v2/rooms', options);
  const { id, error } = await res.json();
  const { token } = await createToken(id, profile);
  return { meetingID: id, token, error };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  const { apiAccessKey, apiSecret } = await decryptKeys(providerProfile);
  try {
    const token = jwt.sign(
      {
        access_key: apiAccessKey,
        user_id: uuid4(),
        room_id: channelName,
        role: isOwner ? 'host' : 'guest',
        type: 'app',
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
      },
      apiSecret,
      {
        algorithm: 'HS256',
        expiresIn: '24h',
        jwtid: uuid4(),
      }
    );
    return { channel: channelName, token };
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`failed to generate token: ${e.toString()}`);
    }
    throw new Error(`failed to generate token: ${e}`);
  }
};
