// Touched 2024-05-12
import { connect } from 'twilio-video';
import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';

export class ProviderTwilio extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
    this.room = null;
    this.tracks = [];
  }

  handleReceiveSettings() {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    const count = this.tracks.length;
    const dimensions =
      count < this.config?.receiveSettingsMid ?? 5
        ? { width: 1280, height: 720 }
        : count < this.config?.receiveSettingsLow ?? 9
        ? { width: 640, height: 360 }
        : { width: 320, height: 180 };

    this.room.participants.forEach((participant) => {
      participant.videoTracks.forEach((publication) => {
        if (publication.track) {
          publication.track.setContentPreferences({
            renderDimensions: dimensions,
          });
        }
      });
    });
  }

  async handleRenewToken() {
    return renewToken(this.config.meetingID, this.config.providerProfile);
  }

  join() {
    super.join();
    const asyncJoin = async () => {
      if (this.config.providerProfile !== 'custom') {
        this.config.token = await this.handleRenewToken();
      }
      const enableVideo =
        !this.config.ils || (this.config.ils && this.config.isHost);
      this.room = await connect(this.config.token, {
        automaticSubscription: true,
        preferredVideoCodecs: [
          { codec: 'VP8', simulcast: this.config.enableSimulcast },
        ],
        audio: false,
        video: enableVideo
          ? {
              width: this.config.videoConstraints.width,
              height: this.config.videoConstraints.height,
              frameRate: 30,
              deviceId: { exact: this.deviceId },
            }
          : false,
        bandwidthProfile: {
          video: {
            mode: 'grid',
            maxSubscriptionBitrate: 0,
            contentPreferencesMode: 'manual',
          },
        },
        region: this.config.region === '' ? 'gll' : this.config.region,
        name: this.config.meetingID,
      });
      window.room = this.room;

      this.room.on('participantConnected', () => this.participants());
      this.room.on('participantDisconnected', () => this.participants());
      this.room.on('trackSubscribed', () => this.participants());
      this.room.on('trackUnsubscribed', () => this.participants());
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
    this.room.localParticipant.videoTracks.forEach((t) =>
      this.tracks.push(t.track)
    );
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
    this.room.off('participantConnected', () => this.participants());
    this.room.off('participantDisconnected', () => this.participants());
    this.room.off('trackSubscribed', () => this.participants());
    this.room.off('trackUnsubscribed', () => this.participants());
    this.room.disconnect();
  }
}

export default ProviderTwilio;
