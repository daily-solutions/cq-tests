export class ProviderEvent extends Event {
  constructor(name, data) {
    super(name);
    this.data = data;
  }
}

export class Provider extends EventTarget {
  static EVENT_STATE_CHANGE = 'state-change';
  static EVENT_PARTICIPANTS_UPDATED = 'participants-updated';
  static EVENT_STATS_UPDATE = 'stats-update';

  static STATE_IDLE = 'idle';
  static STATE_JOINING = 'joining';
  static STATE_JOINED = 'joined';
  static STATE_LEFT = 'left';

  constructor(providerConfig, deviceId) {
    super();

    this.config = providerConfig;
    this.deviceId = deviceId;
    this.state = Provider.STATE_IDLE;

    return this;
  }

  join() {
    // join here

    this.dispatchEvent(
      new ProviderEvent(Provider.EVENT_STATE_CHANGE, Provider.STATE_JOINING)
    );
  }

  joined() {
    // joined here

    this.dispatchEvent(
      new ProviderEvent(Provider.EVENT_STATE_CHANGE, Provider.STATE_JOINED)
    );
  }

  participants(participants) {
    // update participants state here

    this.dispatchEvent(
      new ProviderEvent(Provider.EVENT_PARTICIPANTS_UPDATED, participants)
    );
  }

  leave() {
    // leave here
    this.dispatchEvent(
      new ProviderEvent(Provider.EVENT_STATE_CHANGE, Provider.STATE_LEFT)
    );

    // Teardown
    console.log('🛑 Provider teardown');
  }
}

export default Provider;
