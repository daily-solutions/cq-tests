import randomWords from 'random-words';
import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedTwilioAccountSID = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.accountSid
  );
  const encryptedTwilioAuthToken = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.authToken
  );
  const encryptedTwilioAPIKey = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.apiKey
  );
  const encryptedTwilioAPISecret = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.apiSecret
  );
  return {
    accountSid: encryptedTwilioAccountSID,
    authToken: encryptedTwilioAuthToken,
    apiKey: encryptedTwilioAPIKey,
    apiSecret: encryptedTwilioAPISecret,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedAccountSID = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.accountSid
  );
  const decryptedAuthToken = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.authToken
  );
  const decryptedApiKey = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.apiKey
  );
  const decryptedApiSecret = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.apiSecret
  );

  return {
    accountSid: decryptedAccountSID,
    authToken: decryptedAuthToken,
    apiKey: decryptedApiKey,
    apiSecret: decryptedApiSecret,
  };
};

export const createRoom = async (providerProfile, config) => {
  const { accountSid, authToken } = await decryptKeys(providerProfile);
  const client = require('twilio')(accountSid, authToken);
  const uniqueName = randomWords({ exactly: 2, join: '-' });

  const room = await client.video.v1.rooms.create({
    uniqueName,
    type: 'group',
    mediaRegion: config.meshSFU ? 'gll' : config.region,
  });

  if (!room.sid) return { error: 'failed to create room' };

  const { token } = await createToken(uniqueName, providerProfile);

  return { meetingID: uniqueName, token, error: null };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  const AccessToken = require('twilio').jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  const { accountSid, apiKey, apiSecret } = await decryptKeys(providerProfile);
  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity: randomWords(),
  });
  const grant = new VideoGrant({ room: channelName });
  token.addGrant(grant);

  return { channel: channelName, token: token.toJwt() };
};
