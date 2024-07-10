import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import randomWords from 'random-words';
import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedHostURL = crypt(process.env.NEXT_SECRET_PHRASE, config.host);
  const encryptedAPIKey = crypt(process.env.NEXT_SECRET_PHRASE, config.apiKey);
  const encryptedAPISecret = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.apiSecret
  );
  return {
    host: encryptedHostURL,
    apiKey: encryptedAPIKey,
    apiSecret: encryptedAPISecret,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedHost = decrypt(process.env.NEXT_SECRET_PHRASE, data.key.host);
  const decryptedApiKey = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.apiKey
  );
  const decryptedApiSecret = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.apiSecret
  );

  return {
    host: decryptedHost,
    apiKey: decryptedApiKey,
    apiSecret: decryptedApiSecret,
  };
};

export const createRoom = async (providerProfile, config) => {
  const { host, apiKey, apiSecret } = await decryptKeys(providerProfile);

  const client = new RoomServiceClient(host, apiKey, apiSecret);

  const uniqueName = randomWords({ exactly: 2, join: '-' });
  const room = await client.createRoom({ name: uniqueName });

  if (!room.sid) return { error: 'failed to create room' };

  const { token } = await createToken(uniqueName, providerProfile);

  return { meetingID: uniqueName, token, host, error: null };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  const { apiKey, apiSecret } = await decryptKeys(providerProfile);
  const token = new AccessToken(apiKey, apiSecret, {
    identity: randomWords(),
  });
  token.addGrant({
    roomJoin: true,
    room: channelName,
    canPublish: true,
    canSubscribe: true,
  });

  return { channel: channelName, token: token.toJwt() };
};
