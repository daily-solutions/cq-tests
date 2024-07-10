export const agoraSimulcastSettings = (simulcastSettings) => {
  return simulcastSettings
    .sort((a, b) => b.downscale - a.downscale)
    .map((ss) => ({
      maxBitrate: ss.bitrate, // in kbps
      maxFramerate: ss.frameRate,
      scaleResolutionDownBy: ss.downscale,
    }));
};
