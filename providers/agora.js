// updated 2024-05-12
import AgoraRTC from 'agora-rtc-sdk-ng';

import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';
import { agoraSimulcastSettings } from '../utils/agoraSimulcastSettings';

export class ProviderAgora extends Provider {
  static StateEvent = new Event('state-change');

  constructor(providerConfig, deviceId) {
    super(providerConfig, deviceId);
    this.deviceId = deviceId;
    this.callObject = AgoraRTC.createClient({
      codec: 'vp8',
      mode: providerConfig.ils ? 'live' : 'rtc',
    });
    AgoraRTC.setArea({
      areaCode: this.config.region === '' ? 'GLOBAL' : this.config.region,
    });

    if (providerConfig.enableSimulcast && !providerConfig.ils) {
      this.callObject.enableDualStream();
    }

    this.callObject.on('user-published', async (user, mediaType) => {
      await this.callObject.subscribe(user, mediaType);
      this.participants();
    });
    this.callObject.on('user-unpublished', () => this.participants());
    this.callObject.on('user-joined', () => this.participants());
    this.callObject.on('user-left', () => this.participants());
    this.callObject.on('token-privilege-will-expire', async () => {
      if (this.config.providerProfile !== 'custom') {
        const token = await this.handleRenewToken();
        await this.callObject.renewToken(token);
      }
    });
    this.callObject.on('token-privilege-did-expire', async () => {
      if (this.config.providerProfile !== 'custom') {
        const token = await this.handleRenewToken();
        await this.callObject.renewToken(token);
      }
    });
  }

  async handleRenewToken() {
    return renewToken(this.config.meetingID, this.config.providerProfile);
  }

  handleReceiveSettings() {
    if (!this.config?.receiveSettings || !this.config.enableSimulcast) return;

    const count = this.callObject.remoteUsers.length + 1;
    const layer = count < (this.config?.receiveSettingsLow ?? 9) ? 0 : 1;
    this.callObject.remoteUsers.map((user) =>
      this.callObject.setRemoteVideoStreamType(user.uid, layer)
    );
  }

  async createVideoTrack({ high, low }) {
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      cameraId: this.deviceId ?? undefined,
      encoderConfig: high,
    });
    if (
      this.config.enableSimulcast &&
      this.config.simulcast.length > 0 &&
      Object.keys(low).length > 0
    ) {
      this.callObject.setLowStreamParameter(low);
    }
    await this.callObject.publish([this.localVideoTrack]);
  }

  join() {
    super.join();
    const asyncJoin = async () => {
      if (this.config.providerProfile !== 'custom') {
        this.config.token = await this.handleRenewToken();
      }

      if (this.config.simulcast.length > 0) {
        this.config.simulcast = agoraSimulcastSettings(this.config.simulcast);
      }

      const config = {
        high: {
          ...this.config.videoConstraints,
          bitrateMax: this.config.simulcast[1]?.maxBitrate ?? undefined,
          frameRate:
            this.config.simulcast[1]?.maxFramerate ?? this.config.frameRate,
        },
        low: this.config.enableSimulcast
          ? {
              width: {
                ideal:
                  this.config.videoConstraints.width /
                  this.config.simulcast[0]?.scaleResolutionDownBy,
              },
              height: {
                ideal:
                  this.config.videoConstraints.height /
                  this.config.simulcast[0]?.scaleResolutionDownBy,
              },
              bitrate: this.config.simulcast[0]?.maxBitrate ?? undefined,
              framerate: {
                ideal: this.config.simulcast[0]?.maxFramerate ?? 30,
              },
            }
          : {},
      };

      if (this.config.ils) {
        await this.callObject.setClientRole(
          this.config.isHost ? 'host' : 'audience'
        );
        await this.callObject.join(
          this.config.appID,
          this.config.meetingID,
          this.config.token
        );
        if (this.config.isHost) await this.createVideoTrack(config);
      } else {
        await this.callObject.join(
          this.config.appID,
          this.config.meetingID,
          this.config.token
        );
        await this.createVideoTrack(config);
      }
      this.joined();
    };
    asyncJoin();
  }

  joined() {
    super.joined();
    this.handleReceiveSettings();
    this.participants();
  }

  participants() {
    const remoteUsersTracks = this.callObject.remoteUsers.map((user) =>
      user?.videoTrack?.getMediaStreamTrack()
    );
    const participants = [...remoteUsersTracks];
    if (this.localVideoTrack) {
      participants.push(this.localVideoTrack.getMediaStreamTrack());
    }

    this.handleReceiveSettings();
    super.participants(participants);
  }

  leave() {
    const asyncLeave = async () => {
      if (this.localVideoTrack) {
        (await this.localVideoTrack).stop();
        (await this.localVideoTrack).close();
      }
      this.callObject.removeAllListeners();
      await this.callObject?.leave();
      super.leave();
    };

    asyncLeave();
  }

  destroy() {
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
    }
    this.callObject.removeAllListeners();
    this.callObject.leave();
  }
}

export default ProviderAgora;
