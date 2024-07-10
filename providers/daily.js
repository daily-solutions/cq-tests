// Updated 2024-05-12
import DailyIframe from '@daily-co/daily-js';
import { getDailySimulcastSettings } from 'utils/getDailySimulcastSettings';
import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';

const STANDARD_HIGH_BITRATE_CAP = 980;
const STANDARD_LOW_BITRATE_CAP = 300;

export class ProviderDaily extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
    this.host = providerConfig.isHost;

    this.callObject = DailyIframe.createCallObject({
      audioSource: false,
      videoSource: deviceId,
      dailyConfig: {
        ...(providerConfig?.videoCodec === 'h264'
          ? {
              preferH264ForCam: true,
              preferH264ForScreenShare: true,
            }
          : {}),
        // check if custom simulcast is enabled, if yes pass the simulcast config else undefined
        camSimulcastEncodings:
          providerConfig.enableSimulcast && providerConfig.customSimulcast
            ? getDailySimulcastSettings(providerConfig.simulcast)
            : undefined,
        disableSimulcast: !providerConfig.enableSimulcast,
        // pass the custom video constraints
        userMediaVideoConstraints: providerConfig.videoConstraints,
      },
    });

    window['callObject'] = this.callObject;

    this.callObject.on('joined-meeting', () => this.joined());
    this.callObject.on('participant-joined', () => this.participants());
    this.callObject.on('participant-updated', () => this.participants());
    this.callObject.on('participant-left', () => this.participants());
    this.callObject.on('network-quality-change', (ev) =>
      this.handleNetworkQualityChange(ev)
    );
  }

  handleReceiveSettings(networkQuality = 'good') {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    const participants = this.callObject.participants();

    const count = Object.keys(participants).length;
    const layer =
      count < this.config?.receiveSettingsMid ?? 5
        ? networkQuality === 'good'
          ? 2
          : networkQuality === 'low'
          ? 1
          : 0
        : count < this.config?.receiveSettingsLow ?? 9
        ? networkQuality === 'good'
          ? 1
          : 0
        : 0;
    const receiveSettings = Object.keys(participants).reduce((settings, id) => {
      if (id === 'local') return settings;
      settings[id] = { video: { layer } };
      return settings;
    }, {});
    if (Object.keys(receiveSettings).length === 0) return;
    this.callObject.updateReceiveSettings(receiveSettings);
  }

  async handleRenewToken() {
    return renewToken(
      this.config.meetingID,
      this.config.providerProfile,
      this.host
    );
  }

  handleNetworkQualityChange(ev) {
    // send side settings based on network quality
    if (this.config?.sendSideSettings) {
      switch (ev.threshold) {
        case 'good':
          const highBitrateCap =
            this.config.sendSettingsHigh ?? STANDARD_HIGH_BITRATE_CAP;
          if (this.lastSetKbs !== highBitrateCap) {
            this.callObject.setBandwidth({ kbs: highBitrateCap });
            this.lastSetKbs = highBitrateCap;
          }
          break;
        case 'low':
        case 'very-low':
          const lowBitrateCap =
            this.config.sendSettingsLow ?? STANDARD_LOW_BITRATE_CAP;
          if (this.lastSetKbs !== lowBitrateCap) {
            this.callObject.setBandwidth({ kbs: lowBitrateCap });
            this.lastSetKbs = lowBitrateCap;
          }
          break;
      }
    }

    // receive side settings based on network quality
    if (this.config.switchLayersBasedOnNetwork) {
      if (this.lastSetThreshold !== ev.threshold) {
        this.handleReceiveSettings(ev.threshold);
        this.lastSetThreshold = ev.threshold;
      }
    }
  }

  join() {
    super.join();
    const asyncJoin = async () => {
      const domain =
        this.config?.domain ?? process.env.NEXT_PUBLIC_PROVIDER_DAILY_DOMAIN;

      if (this.host) {
        this.config.token = await this.handleRenewToken();
      }
      this.callObject.join({
        url: `https://${domain}.daily.co/${this.config.meetingID}`,
        token: this.config.token,
      });
    };
    asyncJoin();
  }

  joined() {
    // Use SFU mode to remove bias of P2P
    this.callObject.setNetworkTopology({ topology: 'sfu' });

    // Update receive settings
    this.handleReceiveSettings();

    super.joined();
    this.participants();
  }

  participants() {
    const participants = Object.values(this.callObject.participants());
    const filteredPermissions = this.config.ils
      ? participants.filter((p) => p.permissions.hasPresence)
      : participants;
    const videoTracks = filteredPermissions.map(
      (p) => p.tracks.video.persistentTrack
    );

    this.handleReceiveSettings();

    super.participants(videoTracks);
  }

  leave() {
    const asyncLeave = async () => {
      await this.callObject.leave();
      this.callObject.on('left-meeting', () => this.callObject.destroy());
      super.leave();
    };

    asyncLeave();
  }

  destroy() {
    this.callObject.off('joined-meeting', () => this.joined());
    this.callObject.off('participant-joined', () => this.participants());
    this.callObject.off('participant-updated', () => this.participants());
    this.callObject.off('participant-left', () => this.participants());
    this.callObject.off('network-quality-change', (ev) =>
      this.handleNetworkQualityChange(ev)
    );
    this.callObject.leave();
    this.callObject.destroy();
  }
}

export default ProviderDaily;
