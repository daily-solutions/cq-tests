// Touched 2024-05-12
import {
  HMSReactiveStore,
  selectPeers,
  selectIsConnectedToRoom,
  HMSSimulcastLayer,
  selectTrackByID,
} from '@100mslive/hms-video-store';
import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';

export class Provider100ms extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
    this.hms = new HMSReactiveStore();
    this.hmsStore = this.hms.getStore();
    this.hmsActions = this.hms.getActions();

    // set log level to be none
    this.hmsActions.setLogLevel(7);

    this.unSubscribeJoinedEvent = this.hmsStore.subscribe(
      () => this.joined(),
      selectIsConnectedToRoom
    );
    this.unSubscribeParticipantsEvent = this.hmsStore.subscribe(
      () => this.participants(),
      selectPeers
    );
  }

  handleReceiveSettings() {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    const totalPeers = this.hmsStore.getState(selectPeers);
    const peers = totalPeers.filter((peer) => {
      if (peer.videoTrack) {
        const track = this.hmsStore.getState(selectTrackByID(peer.videoTrack));
        if (track && track.enabled) return peer;
      }
    });
    const count = peers.length;
    const layer =
      count < this.config?.receiveSettingsMid ?? 5
        ? HMSSimulcastLayer.HIGH
        : count < this.config?.receiveSettingsLow ?? 9
        ? HMSSimulcastLayer.MEDIUM
        : HMSSimulcastLayer.LOW;

    peers.map((peer) => {
      if (peer.videoTrack && !peer.isLocal) {
        this.hmsActions.setPreferredLayer(peer.videoTrack, layer);
      }
    });
  }

  async handleRenewToken() {
    const isOwner = !this.config.ils || (this.config.ils && this.config.isHost);
    return renewToken(
      this.config.meetingID,
      this.config.providerProfile,
      isOwner
    );
  }

  join() {
    super.join();
    const asyncJoin = async () => {
      if (this.config.providerProfile !== 'custom') {
        this.config.token = await this.handleRenewToken();
      }
      const enableVideo =
        !this.config.ils || (this.config.ils && this.config.isHost);
      await this.hmsActions.join({
        userName: 'test',
        authToken: this.config.token,
        settings: {
          isAudioMuted: true,
          isVideoMuted: !enableVideo,
          videoDeviceId: this.deviceId,
        },
        autoVideoSubscribe: true,
        initEndpoint: this.config.initEndpoint,
      });
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
    const peers = this.hmsStore.getState(selectPeers);
    const videoEnabledPeers = peers.filter((peer) => {
      if (peer.videoTrack) {
        const track = this.hmsStore.getState(selectTrackByID(peer.videoTrack));
        if (track && track.enabled) return true;
      }
    });
    super.participants(videoEnabledPeers);
    this.handleReceiveSettings();
  }

  leave() {
    const asyncLeave = async () => {
      await this.hmsActions.leave();
      super.leave();
    };

    asyncLeave();
  }

  destroy() {
    this.unSubscribeJoinedEvent();
    this.unSubscribeParticipantsEvent();
    this.hmsActions.leave();
  }
}

export default Provider100ms;
