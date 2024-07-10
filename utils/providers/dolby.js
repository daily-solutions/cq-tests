import { crypt, decrypt } from '../crypto';
import randomWords from 'random-words';
import { supabase } from '../supabaseClient';
import {
  authentication,
  communications,
} from '@dolbyio/dolbyio-rest-apis-client';

export const encryptKeys = (config) => {
  const encryptedAppKey = crypt(process.env.NEXT_SECRET_PHRASE, config.appKey);
  const encryptedAppSecret = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.appSecret
  );
  return {
    appKey: encryptedAppKey,
    appSecret: encryptedAppSecret,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedAppKey = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.appKey
  );
  const decryptedAppSecret = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.appSecret
  );
  return {
    appKey: decryptedAppKey,
    appSecret: decryptedAppSecret,
  };
};

export const createRoom = async (providerProfile, config) => {
  const { appKey, appSecret } = await decryptKeys(providerProfile);

  const jwt = await authentication.getApiAccessToken(appKey, appSecret, 3600, [
    'comms:conf:create',
  ]);
  const conference = await communications.conference.createConference(jwt, {
    ownerExternalId: 'owner',
    dolbyVoice: true,
    videoCodec: config?.videoCodec === 'h264' ? 'H264' : 'VP8',
    alias: randomWords({ exactly: 2, join: '-' }),
    region: config.region,
  });

  const { token } = await createToken('', providerProfile);

  return {
    meetingID: conference,
    token,
  };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  const { appKey, appSecret } = await decryptKeys(providerProfile);
  const apiToken = await authentication.getApiAccessToken(
    appKey,
    appSecret,
    86400,
    ['comms:client_access_token:create']
  );

  const token = await communications.authentication.getClientAccessTokenV2({
    accessToken: apiToken,
    sessionScope: ['*'],
  });

  return { channelName, token: token.access_token };
};
