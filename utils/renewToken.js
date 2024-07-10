export const renewToken = async (channelName, profile, isOwner = false) => {
  const renewTokenRes = await fetch('/api/renewToken', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profile,
      channelName,
      isOwner,
    }),
  });
  const { token } = await renewTokenRes.json();
  return token;
};
