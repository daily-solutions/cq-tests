import OT from '@opentok/client';
import { Provider } from './Provider';
import { renewToken } from '../utils/renewToken';

type OpenTokTrack = {
  streamId: string;
  track: MediaStreamTrack;
};

type ProviderConfig = {
  token: string;
  apiKey: string;
  meetingID: string;
  videoConstraints: {
    height: number;
    width: number;
  };
  receiveSettings: boolean;
  receiveSettingsLow: number;
  receiveSettingsMid: number;
  ils: boolean;
  isHost: boolean;
  providerProfile?: string;
};

type Resolution =
  | '1920x1080'
  | '1280x960'
  | '1280x720'
  | '640x480'
  | '640x360'
  | '320x240'
  | '320x180';

export default class OpenTok extends Provider {
  session: OT.Session;
  token: string;
  tracks: OpenTokTrack[];
  deviceId: string;
  subscribers: OT.Subscriber[];
  receiveSettings: boolean;
  receiveSettingsLow: number;
  receiveSettingsMid: number;
  videoConstraints: {
    height: number;
    width: number;
  };
  ils: boolean;
  isHost: boolean;
  meetingID: string;
  providerProfile: string;
  constructor(
    {
      token,
      apiKey,
      meetingID,
      videoConstraints,
      receiveSettings,
      receiveSettingsLow,
      receiveSettingsMid,
      ils,
      isHost,
      providerProfile,
    }: ProviderConfig,
    deviceId
  ) {
    super(
      {
        token,
        apiKey,
        meetingID,
        videoConstraints,
        receiveSettings,
        receiveSettingsLow,
        receiveSettingsMid,
        ils,
        isHost,
        providerProfile,
      },
      deviceId
    );
    this.meetingID = meetingID;
    this.providerProfile = providerProfile;
    this.subscribers = [];
    this.tracks = [];
    this.token = token;
    this.deviceId = deviceId;
    this.receiveSettings = receiveSettings;
    this.receiveSettingsLow = receiveSettingsLow ?? 9;
    this.receiveSettingsMid = receiveSettingsMid ?? 5;
    this.videoConstraints = videoConstraints;
    this.ils = ils;
    this.isHost = isHost;

    function handleError(error: unknown) {
      if (error) {
        console.error('handleError: ', error);
      }
    }

    const session = OT.initSession(apiKey, meetingID, {
      connectionEventsSuppressed: ils,
    });

    this.session = session;

    this.session.on('streamCreated', ({ stream }) => {
      const subscriber = this.session.subscribe(
        stream,
        undefined,
        {
          insertMode: 'append',
          width: '100%',
          height: '100%',
          showControls: false,
          insertDefaultUI: false,
        },
        (error) => {
          if (error) {
            handleError(error);
            return;
          }
        }
      );
      this.subscribers.push(subscriber);

      subscriber.on('videoElementCreated', ({ element }) => {
        this.onVideoElementCreated(element, stream.streamId);
      });
    });

    this.session.on('streamDestroyed', (event) => {
      const subs = this.session.getSubscribersForStream(event.stream);

      subs.forEach((sub) => {
        this.subscribers = this.subscribers.filter(
          (s) => s.stream.streamId !== sub.stream.streamId
        );
        session.unsubscribe(sub);
      });

      this.tracks = this.tracks.filter(
        (t) => t.streamId !== event.stream.streamId
      );

      this.participants(this.tracks.map((t) => t.track));
    });
  }

  handleReceiveSettings() {
    if (!this.receiveSettings) return;

    const count = this.tracks.length;
    const layer =
      count < this.receiveSettingsMid
        ? { width: 1280, height: 720 }
        : count < this.receiveSettingsLow
        ? { width: 640, height: 360 }
        : { width: 320, height: 180 };
    this.subscribers.forEach((sub) => sub.setPreferredResolution(layer));
  }

  async handleRenewToken() {
    return renewToken(
      this.meetingID,
      this.providerProfile,
      this.ils ? this.isHost : true
    );
  }

  join() {
    const asyncJoin = async () => {
      this.token = await this.handleRenewToken();

      let publisher = null;
      if (!this.ils || (this.ils && this.isHost)) {
        publisher = OT.initPublisher(
          undefined,
          {
            insertMode: 'append',
            width: '100%',
            height: '100%',
            resolution:
              `${this.videoConstraints?.width}x${this?.videoConstraints.height}` as Resolution,
            frameRate: 30,
            showControls: false,
            publishVideo: true,
            publishAudio: false,
            insertDefaultUI: false,
            videoSource: this.deviceId,
            audioSource: false,
          },
          (err) => {
            if (err) {
              console.error('Publish error ', err);
              return;
            }
          }
        );

        // videoElementCreate is called consistely before
        // streamCreated, so we can use it to add the
        // publisher to the tracks array
        let elm = undefined;
        publisher.on('videoElementCreated', (ev) => {
          elm = ev.element;
        });

        publisher.on('streamCreated', ({ stream }) => {
          const streamId = stream.streamId;
          this.onVideoElementCreated(elm, streamId);
        });
      }

      this.session.connect(this.token, (error) => {
        if (error) {
          console.error('join error: ', error);
          return;
        }
        if (publisher) {
          this.session.publish(publisher, (error) => {
            if (error) {
              console.error(error);
              return;
            }
          });
        }
        this.joined();
      });
    };
    asyncJoin();
  }

  joined() {
    super.joined();
    this.handleReceiveSettings();
  }

  participants(tracks: MediaStreamTrack[]) {
    this.handleReceiveSettings();
    super.participants(tracks);
  }

  leave() {
    this.session.disconnect();
    this.session.on('sessionDisconnected', (event) => {
      this.participants([]);
      super.leave();
    });
  }

  destroy() {
    console.log('destroy');
  }

  private onVideoElementCreated(
    element: HTMLVideoElement | HTMLObjectElement,
    streamId: string
  ) {
    if (element instanceof HTMLVideoElement) {
      const ms = element.srcObject as MediaStream;
      ms.getVideoTracks().forEach((track) => {
        this.tracks.push({ track, streamId });
      });
    }

    this.participants(this.tracks.map((t) => t.track));
  }
}
