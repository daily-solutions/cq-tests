import {
  BJNWebClientSDK,
  ConnectionMode,
  StreamPriority,
  StreamQuality,
  VideoLayout,
  MaxVideoQuality,
} from '@bluejeans/web-client-sdk';
import { Provider } from './Provider';

export class ProviderBlueJeans extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
    this.sdk = new BJNWebClientSDK();

    this.sdk.meetingService.observe('connectionState', async () => {
      if (this.sdk.meetingService.connectionState === 'CONNECTED') {
        this.sdk.meetingService.setVideoLayout(VideoLayout.CUSTOM);
        this.sdk.meetingService.participantService.observe('participants', () =>
          this.participants()
        );
        this.sdk.meetingService.videoStreamService.observe('videoStreams', () =>
          this.participants()
        );
        await this.sdk.meetingService.setMaxVideoSendResolution(
          MaxVideoQuality['720p']
        );
      }
    });
    window['blueJeansSDK'] = this.sdk;
  }

  handleReceiveSettings() {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    const participants =
      this.sdk.meetingService?.participantService?.participants;

    if (!participants) return;

    const count = participants.length;

    const streamQuality =
      count < this.config?.receiveSettingsMid ?? 5
        ? StreamQuality.r720p_30fps
        : count < this.config?.receiveSettingsLow ?? 9
        ? StreamQuality.r360p_15fps
        : StreamQuality.r180p_15fps;

    const configuration = participants.map((p) => ({
      participantGuid: p.participantGuid,
      streamQuality,
      streamPriority: StreamPriority.HIGH,
    }));

    this.sdk.meetingService.videoStreamService.setVideoStreamConfiguration(
      configuration
    );
  }

  join() {
    super.join();
    const asyncJoin = async () => {
      await this.sdk.meetingService.joinMeeting(
        this.config.meetingID,
        this.config.token,
        'Test',
        ConnectionMode.Default
      );
      if (this.deviceId) {
        const selectedCamera =
          this.sdk.videoDeviceService.availableCameras.find(
            (c) => c.id === this.deviceId
          );
        this.sdk.videoDeviceService.selectCamera(selectedCamera);
      }
      this.sdk.meetingService.setVideoMuted(false);
      this.joined();
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
    if (!this.sdk.meetingService.videoStreamService) return;

    const participants =
      this.sdk.meetingService?.videoStreamService?.videoStreams;

    this.handleReceiveSettings();
    super.participants(participants ?? []);
  }

  leave() {
    this.sdk.meetingService.endMeeting();
    super.leave();
  }

  destroy() {
    this.sdk.meetingService.endMeeting();
  }
}

export default ProviderBlueJeans;
