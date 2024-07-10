import Agora from 'agora-access-token';
import randomWords from 'random-words';
import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedAppID = crypt(process.env.NEXT_SECRET_PHRASE, config.appID);
  const encryptedAppCert = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.appCertificate
  );
  return {
    appID: encryptedAppID,
    appCertificate: encryptedAppCert,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedAppID = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.appID
  );
  const decryptedAppCert = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.appCertificate
  );
  return {
    appId: decryptedAppID,
    appCertificate: decryptedAppCert,
  };
};

export const createRoom = async (providerProfile, config) => {
  const { appId } = await decryptKeys(providerProfile);

  const channelName = randomWords({ exactly: 2, join: '-' });
  const { token } = await createToken(channelName, providerProfile);

  return {
    appID: appId,
    meetingID: channelName,
    token,
    error: null,
  };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  const { appId, appCertificate } = await decryptKeys(providerProfile);

  const expirationTimeInSeconds = 86400;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

  const token = Agora.RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    0,
    Agora.RtcRole.PUBLISHER,
    expirationTimestamp
  );

  return { channel: channelName, appID: appId, token };
};
