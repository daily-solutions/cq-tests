import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedAPIKey = crypt(process.env.NEXT_SECRET_PHRASE, config.key);
  return { key: encryptedAPIKey };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedAPIKey = decrypt(process.env.NEXT_SECRET_PHRASE, data.key.key);
  return { apiKey: decryptedAPIKey };
};

export const createRoom = async (providerProfile, config) => {
  const { apiKey } = await decryptKeys(providerProfile);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      privacy: 'public',
      properties: {
        enable_mesh_sfu: config.meshSFU,
        ...(config.region && !config.meshSFU ? { geo: config.region } : {}),
        ...(config.ils
          ? { permissions: { canSend: false, hasPresence: false } }
          : {}),
      },
    }),
  };
  const res = await fetch('https://api.daily.co/v1/rooms', options);

  const { name, url, error } = await res.json();

  return { domain: url.substring(8).split('.')?.[0], meetingID: name, error };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  const { apiKey } = await decryptKeys(providerProfile);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: channelName,
        is_owner: isOwner,
      },
    }),
  };

  const resToken = await fetch(
    'https://api.daily.co/v1/meeting-tokens',
    options
  );
  const { token } = await resToken.json();
  return { channel: channelName, token };
};
