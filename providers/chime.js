import {
  LogLevel,
  ConsoleLogger,
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  DefaultDeviceController,
} from 'amazon-chime-sdk-js';
import { Provider } from './Provider';
import ChimeCustomUplinkPolicy from '../utils/ChimeCustomUplinkPolicy';
import { renewToken } from '../utils/renewToken';

const DEFAULT_SIMULCAST = [
  { scaleResolutionDownBy: 4, maxBitrate: 80, maxFramerate: 10 },
  { scaleResolutionDownBy: 2, maxBitrate: 200, maxFramerate: 15 },
  { scaleResolutionDownBy: 1, maxBitrate: 680, maxFramerate: 15 },
];

const getSimulcastSettings = (config) => {
  if (config.customSimulcast) {
    return config.customSimulcast
      .sort((a, b) => b.downscale - a.downscale)
      .map((ss) => ({
        maxBitrate: ss.bitrate * 1000,
        maxFramerate: ss.frameRate,
        scaleResolutionDownBy: ss.downscale,
      }));
  } else return DEFAULT_SIMULCAST;
};

export class ProviderChime extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
  }

  handleReceiveSettings() {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    // @TODO: update receive settings once we enable custom simulcast in Chime
  }

  async handleRenewToken() {
    return await renewToken(
      this.config.meetingID.MeetingId,
      this.config.providerProfile
    );
  }

  join() {
    super.join();
    const asyncJoin = async () => {
      if (this.config.providerProfile !== 'custom') {
        this.config.token = await this.handleRenewToken();
      }
      const logger = new ConsoleLogger('MyLogger', LogLevel.OFF);
      const deviceController = new DefaultDeviceController(logger);

      const configuration = new MeetingSessionConfiguration(
        this.config.meetingID,
        this.config.token
      );

      if (this.config.enableSimulcast) {
        configuration.enableUnifiedPlanForChromiumBasedBrowsers = true;
        configuration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = true;
        configuration.videoUplinkBandwidthPolicy = new ChimeCustomUplinkPolicy(
          this.config.token.AttendeeId,
          logger,
          getSimulcastSettings(this.config),
          {
            mid: this.config?.receiveSettingsMid ?? 5,
            low: this.config?.receiveSettingsLow ?? 9,
          }
        );
      }

      this.meetingSession = new DefaultMeetingSession(
        configuration,
        logger,
        deviceController
      );

      const observer = {
        audioVideoDidStart: () => this.joined(),
        videoTileDidUpdate: () => this.participants(),
        videoTileWasRemoved: () => this.participants(),
        remoteVideoSourcesDidChange: () => this.participants(),
      };
      this.meetingSession.audioVideo.addObserver(observer);

      this.meetingSession.audioVideo.start();
      this.meetingSession.audioVideo.chooseVideoInputQuality(
        this.config.videoConstraints.width,
        this.config.videoConstraints.height,
        15
      );
      if (!this.deviceId) {
        const devices =
          await this.meetingSession.audioVideo.listVideoInputDevices();
        this.deviceId = devices[0].deviceId;
      }
      if (!this.config.ils || (this.config.ils && this.config.isHost)) {
        await this.meetingSession.audioVideo.startVideoInput(this.deviceId);
        this.meetingSession.audioVideo.startLocalVideoTile();
      }
      window.meetingSession = this.meetingSession;
    };
    asyncJoin();
  }

  joined() {
    // Update receive settings
    this.handleReceiveSettings();

    super.joined();
    this.participants();
  }

  participants() {
    const participants = this.meetingSession.audioVideo.getAllVideoTiles();
    super.participants(participants);
  }

  leave() {
    this.meetingSession.destroy();
    super.leave();
  }

  destroy() {
    this.meetingSession.destroy();
  }
}

export default ProviderChime;
