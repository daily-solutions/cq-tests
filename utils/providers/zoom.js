import { KJUR } from 'jsrsasign';
import randomWords from 'random-words';
import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedZoomSDKKey = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.sdkKey
  );
  const encryptedZoomSDKSecret = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.sdkSecret
  );
  return {
    sdkKey: encryptedZoomSDKKey,
    sdkSecret: encryptedZoomSDKSecret,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedSdkKey = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.sdkKey
  );
  const decryptedSdkSecret = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.sdkSecret
  );
  return { sdkKey: decryptedSdkKey, sdkSecret: decryptedSdkSecret };
};

export const createRoom = async (providerProfile, config) => {
  const topic = randomWords({ exactly: 2, join: '-' });

  const { token } = await createToken(topic, providerProfile);

  return {
    meetingID: topic,
    token,
    error: null,
  };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  const { sdkKey, sdkSecret } = await decryptKeys(providerProfile);
  const iat = Math.round(new Date().getTime() / 1000);
  const exp = iat + 60 * 60 * 24;

  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const payload = JSON.stringify({
    app_key: sdkKey,
    iat,
    exp,
    tpc: channelName,
    pwd: 'testing',
    session_key: channelName,
    role_type: 1, // 1 = host
  });

  const jwt = KJUR.jws.JWS.sign('HS256', header, payload, sdkSecret);

  return {
    channel: channelName,
    token: jwt,
  };
};
