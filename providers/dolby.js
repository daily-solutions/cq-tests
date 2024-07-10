import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';
import VoxeetSDK from '@voxeet/voxeet-web-sdk';

export class ProviderDolby extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);

    VoxeetSDK.packageUrlPrefix =
      'https://cdn.jsdelivr.net/npm/@voxeet/voxeet-web-sdk/dist';

    VoxeetSDK.conference.on('joined', () => this.joined());
    VoxeetSDK.conference.on('participantAdded', () => this.participants());
    VoxeetSDK.conference.on('participantUpdated', () => this.participants());
    VoxeetSDK.conference.on('participantLeft', () => this.participants());
    VoxeetSDK.conference.on('streamAdded', () => this.participants());
    VoxeetSDK.conference.on('streamUpdated', () => this.participants());
    VoxeetSDK.conference.on('streamRemoved', () => this.participants());

    window['sdk'] = VoxeetSDK;
  }

  handleReceiveSettings() {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    const count = VoxeetSDK.conference.participants.size;
    const quality =
      count < this.config?.receiveSettingsMid ?? 5
        ? 'hd'
        : count < this.config?.receiveSettingsLow ?? 9
        ? 'md'
        : 'sd';

    const simulcast = Object.keys(VoxeetSDK.conference.participants).map(
      (p) => ({ id: p.id, quality })
    );
    VoxeetSDK.conference.simulcast(simulcast);
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
      VoxeetSDK.initializeToken(this.config.token, (isExpired) => {
        return new Promise((resolve) => {
          if (isExpired)
            this.handleRenewToken().then((token) => resolve(token));
          else resolve(this.config.token);
        });
      });
      try {
        if (this.deviceId) {
          await VoxeetSDK.mediaDevice.selectVideoInput(this.deviceId);
        }
        await VoxeetSDK.session.open({ name: 'test', externalId: 'owner' });
        VoxeetSDK.conference
          .create({
            alias: this.config.meetingID.conferenceAlias,
          })
          .then((conference) => {
            VoxeetSDK.conference.join(conference, {
              simulcast: this.config.enableSimulcast,
            });
          });
      } catch (e) {
        console.error(e);
      }
    };
    asyncJoin();
  }

  joined() {
    VoxeetSDK.video.local.start();
    // Update receive settings
    this.handleReceiveSettings();

    super.joined();
    this.participants();
  }

  participants() {
    const videoEnabledParticipants = [];
    VoxeetSDK.conference.participants.forEach((p) => {
      const stream = p.streams.filter((s) => s.type === 'Camera');
      if (stream.length > 0) {
        videoEnabledParticipants.push(stream[0]);
      }
    });
    super.participants(videoEnabledParticipants);
    this.handleReceiveSettings();
  }

  leave() {
    const asyncLeave = async () => {
      await VoxeetSDK.conference.leave();
      super.leave();
    };

    asyncLeave();
  }

  destroy() {
    VoxeetSDK.conference.leave();
  }
}

export default ProviderDolby;
