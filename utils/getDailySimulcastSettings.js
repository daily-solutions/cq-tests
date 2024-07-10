export const getDailySimulcastSettings = (simulcastSettings) => {
  const dailySimulcastSettings = [];
  if (simulcastSettings.length > 0) {
    simulcastSettings
      .sort((a, b) => b.downscale - a.downscale)
      .forEach((ss) => {
        dailySimulcastSettings.push({
          maxBitrate: ss.bitrate * 1000,
          maxFramerate: ss.frameRate,
          scaleResolutionDownBy: ss.downscale,
        });
      });
  } else return undefined;
  return dailySimulcastSettings;
};
