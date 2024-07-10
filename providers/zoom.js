import ZoomVideo from '@zoom/videosdk';
import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';

export class ProviderZoom extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
    this.client = ZoomVideo.createClient();
    this.client.init('en-US', 'CDN');

    this.client.on('user-added', () => this.participants());
    this.client.on('user-updated', () => this.participants());
    this.client.on('user-removed', () => this.participants());
    this.client.on('video-active-change', () => this.participants());
    this.client.on('peer-video-state-change', () => this.participants());
    this.client.on('video-dimension-change', () => this.participants());
    window['zoom'] = this.client;
  }

  handleReceiveSettings() {
    // doesn't support receive settings
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
      this.client
        .join(
          this.config.meetingID,
          this.config.token,
          'randomUserName',
          'testing'
        )
        .then(() => {
          this.stream = this.client.getMediaStream();
          try {
            this.stream.startVideo({
              cameraId: this.deviceId,
            });
          } catch (error) {
            console.log(error);
          }
          this.joined();
        })
        .catch((error) => {
          console.log(error);
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
    let participants = this.client.getAllUser();
    participants = participants.filter((user) => user.bVideoOn);
    //this.handleReceiveSettings();

    super.participants(participants);
  }

  leave() {
    this.client.leave();
    super.leave();
  }

  destroy() {
    this.client.off('user-added', () => this.participants());
    this.client.off('user-updated', () => this.participants());
    this.client.off('user-removed', () => this.participants());
    this.client.off('video-active-change', () => this.participants());
    this.client.off('peer-video-state-change', () => this.participants());
    this.client.off('video-dimension-change', () => this.participants());
    this.client.leave();
  }
}

export default ProviderZoom;
