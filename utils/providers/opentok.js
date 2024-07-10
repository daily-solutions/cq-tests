import OpenTok from 'opentok';
import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedOpentokAPIKey = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.apiKey
  );
  const encryptedAPISecret = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.apiSecret
  );
  return {
    apiKey: encryptedOpentokAPIKey,
    apiSecret: encryptedAPISecret,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedAPIKey = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.apiKey
  );

  const decryptedAPISecret = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.apiSecret
  );

  return { apiKey: decryptedAPIKey, apiSecret: decryptedAPISecret };
};

export const createRoom = async (providerProfile, config) => {
  const { apiKey, apiSecret } = await decryptKeys(providerProfile);
  const opentok = new OpenTok(apiKey, apiSecret);

  try {
    const session = await new Promise((resolve, reject) => {
      opentok.createSession({ mediaMode: 'routed' }, (err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    });

    const token = session.generateToken();

    return { meetingID: session.sessionId, token, apiKey, error: null };
  } catch (error) {
    return { meetingID: null, token: null, apiKey, error };
  }
};

export const createToken = async (channelName, providerProfile, isOwner) => {
  const { apiKey, apiSecret } = await decryptKeys(providerProfile);
  const opentok = new OpenTok(apiKey, apiSecret);
  const token = opentok.generateToken(channelName, {
    role: isOwner ? 'publisher' : 'subscriber',
  });

  return { channel: channelName, token };
};
