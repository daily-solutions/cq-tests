// Touched 2024-05-12
import { Room, RoomEvent, VideoPreset, VideoQuality } from 'livekit-client';
import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';

const DEFAULT_SIMULCAST_LAYERS = [
  new VideoPreset(1280, 720, 680000, 30),
  new VideoPreset(640, 360, 200000, 15),
  new VideoPreset(320, 180, 80000, 10),
];

export const getSimulcastLayers = (config) => {
  if (!config.enableSimulcast) return;

  const simulcast = config.simulcast;

  if (simulcast.length === 0) return DEFAULT_SIMULCAST_LAYERS;
  return simulcast
    .sort((a, b) => b.width - a.width)
    .map(
      (ss) =>
        new VideoPreset(
          1280 / ss.scaleResolutionDownBy,
          720 / ss.scaleResolutionDownBy,
          ss.bitrate * 1000,
          ss.frameRate
        )
    );
};

export class ProviderLiveKit extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
    this.room = null;
    this.tracks = [];

    this.room = new Room({
      videoCaptureDefaults: {
        deviceId,
        resolution: {
          width: providerConfig.videoConstraints.width,
          height: providerConfig.videoConstraints.height,
          frameRate: 30,
        },
      },
      publishDefaults: {
        simulcast: providerConfig.enableSimulcast,
        videoSimulcastLayers: getSimulcastLayers(providerConfig),
      },
    });

    window.room = this.room;

    this.room
      .on(RoomEvent.ParticipantConnected, () => this.participants())
      .on(RoomEvent.TrackSubscribed, () => this.participants())
      .on(RoomEvent.TrackUnsubscribed, () => this.participants())
      .on(RoomEvent.ParticipantDisconnected, () => this.participants());
  }

  handleReceiveSettings() {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    const count = this.tracks.length;
    const quality =
      count < this.config?.receiveSettingsMid ?? 5
        ? VideoQuality.HIGH
        : count < this.config?.receiveSettingsLow ?? 9
        ? VideoQuality.MEDIUM
        : VideoQuality.LOW;

    this.room.participants.forEach((participant) => {
      participant.videoTracks.forEach((t) => t.setVideoQuality(quality));
    });
  }

  async handleRenewToken() {
    return await renewToken(this.config.meetingID, this.config.providerProfile);
  }

  join() {
    super.join();
    const asyncJoin = async () => {
      if (this.config.providerProfile !== 'custom') {
        this.config.token = await this.handleRenewToken();
      }
      await this.room.connect(this.config.host, this.config.token);
      if (!this.config.ils || (this.config.ils && this.config.isHost)) {
        await this.room.localParticipant.setCameraEnabled(true);
      }
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
    this.tracks = [];
    this.room.localParticipant.videoTracks.forEach((t) => {
      if (t.track) this.tracks.push(t.track);
    });
    this.room.participants.forEach((participant) => {
      participant.videoTracks.forEach((t) => {
        if (t.track) this.tracks.push(t.track);
      });
    });
    this.handleReceiveSettings();

    super.participants(this.tracks);
  }

  leave() {
    this.room.disconnect();
    super.leave();
  }

  destroy() {
    this.room.disconnect();
  }
}

export default ProviderLiveKit;
