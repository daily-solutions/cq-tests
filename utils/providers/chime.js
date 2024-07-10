import { Chime } from '@aws-sdk/client-chime';
import uuid4 from 'uuid4';
import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedAccessKeyId = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.accessKeyId
  );
  const encryptedSecretAccessKey = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.secretAccessKey
  );
  return {
    accessKeyId: encryptedAccessKeyId,
    secretAccessKey: encryptedSecretAccessKey,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedAccessKeyId = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.accessKeyId
  );
  const decryptedSecretAccessKey = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.secretAccessKey
  );
  return {
    accessKeyId: decryptedAccessKeyId,
    secretAccessKey: decryptedSecretAccessKey,
  };
};

export const createRoom = async (providerProfile, config) => {
  const { accessKeyId, secretAccessKey } = await decryptKeys(providerProfile);

  const chime = new Chime({
    endpoint: 'https://service.chime.aws.amazon.com',
    credentials: { accessKeyId, secretAccessKey },
    region: 'us-east-1',
  });

  try {
    const { Meeting } = await chime.createMeeting({
      ClientRequestToken: uuid4(),
      ...(config.region ? { MediaRegion: config.region } : {}),
    });
    const { token, error } = await createToken(
      Meeting.MeetingId,
      providerProfile
    );
    return { meetingID: Meeting, token, error };
  } catch (e) {
    console.error(e);
    return { error: `Failed to create room, error: ${e.message}` };
  }
};

export const createToken = async (
  meetingId,
  providerProfile,
  isOwner = false
) => {
  const { accessKeyId, secretAccessKey } = await decryptKeys(providerProfile);

  const chime = new Chime({
    endpoint: 'https://service.chime.aws.amazon.com',
    credentials: { accessKeyId, secretAccessKey },
    region: 'us-east-1',
  });

  try {
    const { Attendee } = await chime.createAttendee({
      MeetingId: meetingId,
      ExternalUserId: uuid4(),
    });

    return {
      meetingId,
      token: Attendee,
      error: null,
    };
  } catch (e) {
    return { error: `failed to create token, error: ${e.message}` };
  }
};
