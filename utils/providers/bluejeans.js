import { crypt, decrypt } from '../crypto';
import { supabase } from '../supabaseClient';

export const encryptKeys = (config) => {
  const encryptedUsername = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.username
  );
  const encryptedPassword = crypt(
    process.env.NEXT_SECRET_PHRASE,
    config.password
  );
  return {
    username: encryptedUsername,
    password: encryptedPassword,
  };
};

const decryptKeys = async (providerProfile) => {
  const { data } = await supabase
    .from('provider')
    .select('key')
    .eq('id', providerProfile)
    .single();

  const decryptedUsername = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.username
  );
  const decryptedPassword = decrypt(
    process.env.NEXT_SECRET_PHRASE,
    data.key.password
  );
  return {
    username: decryptedUsername,
    password: decryptedPassword,
  };
};

export const createRoom = async (providerProfile, config) => {
  const { username, password } = await decryptKeys(providerProfile);

  const { accessToken, userId, error } = await createAccessToken(
    username,
    password
  );

  if (error) return { error };

  const {
    meetingID,
    token,
    error: scheduleMeetingError,
  } = await scheduleMeeting(accessToken, userId);

  return {
    meetingID,
    token,
    error: scheduleMeetingError,
  };
};

export const createToken = async (
  channelName,
  providerProfile,
  isOwner = false
) => {
  // const { appId, appCertificate } = await decryptKeys(providerProfile);
  // const expirationTimeInSeconds = 86400;
  // const currentTimestamp = Math.floor(Date.now() / 1000);
  // const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;
  // const token = Agora.RtcTokenBuilder.buildTokenWithUid(
  //   appId,
  //   appCertificate,
  //   channelName,
  //   0,
  //   Agora.RtcRole.PUBLISHER,
  //   expirationTimestamp
  // );
  // return { channel: channelName, appID: appId, token };
};

const createAccessToken = async (username, password) => {
  try {
    const response = await fetch(
      'https://api.bluejeans.com/oauth2/token?Password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'password',
          username,
          password,
        }),
      }
    );
    const resData = await response.json();
    return { accessToken: resData.access_token, userId: resData.scope.user };
  } catch (error) {
    return { error };
  }
};

const scheduleMeeting = async (accessToken, userId) => {
  const now = new Date();
  let localOffset = now.getTimezoneOffset();
  let dateNow = new Date(
    now.getTime() - localOffset * 60 * 1000 - 7 * 60 * 60 * 1000
  );

  const startTime = Math.floor(dateNow.getTime() / 1000);
  const endTime = Math.floor(
    new Date(dateNow.getTime() + 60 * 60 * 1000) / 1000
  );
  try {
    const response = await fetch(
      `https://api.bluejeans.com/v1/user/${userId}/scheduled_meeting?email=false&access_token=${accessToken}&personal_meeting=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          title: 'My First API Scheduled Meeting',
          description: 'Some tests',
          start: startTime,
          end: endTime,
          timezone: 'America/Los_Angeles',
          addAttendeePasscode: true,
          endPointVersion: 'Web',
          endPointType: '1',
          allow720p: true,
          advancedMeetingOptions: {
            autoRecord: false,
            muteParticipantsOnEntry: false,
            encryptionType: 'NO_ENCRYPTION',
            moderatorLess: true,
            videoBestFit: true,
            disallowChat: false,
            publishMeeting: true,
            showAllAttendeesInMeetingInvite: false,
          },
        }),
      }
    );

    const data = await response.json();
    return { meetingID: data.numericMeetingId, token: data.attendeePasscode };
  } catch (error) {
    return { error };
  }
};
