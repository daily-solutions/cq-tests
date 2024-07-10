export const PROVIDER_MAPPING = {
  daily: 'Daily',
  chime: 'Amazon Chime',
  agora: 'Agora',
  '100ms': '100ms',
  opentok: 'OpenTok',
  zoom: 'Zoom',
  livekit: 'LiveKit',
  twilio: 'Twilio',
  bluejeans: 'BlueJeans',
  dolby: 'Dolby',
};

export const PROVIDER_SIMULCAST = {
  daily: 3,
  chime: 2,
  '100ms': 3,
  zoom: 0,
  livekit: 3,
  twilio: 3,
  bluejeans: 0,
  agora: 2,
  dolby: 0,
};

export const PROVIDER_RECEIVE = {
  opentok: 2,
  daily: 2,
  agora: 1,
  chime: 0,
  '100ms': 2,
  zoom: 0,
  livekit: 2,
  twilio: 2,
  bluejeans: 0,
  dolby: 0,
};

export const DAILY_REGIONS = [
  { label: 'Region of the first participant', value: '' },
  { label: 'AF South 1 (Cape Town)', value: 'af-south-1' },
  { label: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
  { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
  { label: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
  { label: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
  { label: 'EU (Frankfurt)', value: 'eu-central-1' },
  { label: 'EU (London)', value: 'eu-west-2' },
  { label: 'South America (São Paulo)', value: 'sa-east-1' },
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'US West (Oregon)', value: 'us-west-2' },
];

export const AGORA_REGIONS = [
  { label: 'Global', value: '' },
  { label: 'Mainland China', value: 'CHINA' },
  { label: 'North America', value: 'NORTH_AMERICA' },
  { label: 'Europe', value: 'EUROPE' },
  { label: 'Asia excluding Mainland China', value: 'ASIA' },
  { label: 'Japan', value: 'JAPAN' },
  { label: 'India', value: 'INDIA' },
];

export const HMS_REGIONS = [
  { label: 'Auto', value: '' },
  { label: 'India', value: 'IN' },
  { label: 'USA', value: 'US' },
  { label: 'Europe', value: 'EU' },
];

export const CHIME_REGIONS = [
  { label: 'Auto', value: '' },
  {
    label: 'af-south-1',
    value: 'af-south-1',
  },
  {
    label: 'ap-northeast-1',
    value: 'ap-northeast-1',
  },
  {
    label: 'ap-northeast-2',
    value: 'ap-northeast-2',
  },
  {
    label: 'ap-south-1',
    value: 'ap-south-1',
  },
  {
    label: 'ap-southeast-1',
    value: 'ap-southeast-1',
  },
  {
    label: 'ap-southeast-2',
    value: 'ap-southeast-2',
  },
  {
    label: 'ca-central-1',
    value: 'ca-central-1',
  },
  {
    label: 'eu-central-1',
    value: 'eu-central-1',
  },
  {
    label: 'eu-north-1',
    value: 'eu-north-1',
  },
  {
    label: 'eu-south-1',
    value: 'eu-south-1',
  },
  {
    label: 'eu-west-1',
    value: 'eu-west-1',
  },
  {
    label: 'eu-west-2',
    value: 'eu-west-2',
  },
  {
    label: 'eu-west-3',
    value: 'eu-west-3',
  },
  {
    label: 'sa-east-1',
    value: 'sa-east-1',
  },
  {
    label: 'us-east-1',
    value: 'us-east-1',
  },
  {
    label: 'us-west-2',
    value: 'us-west-2',
  },
];

export const TWILIO_REGIONS = [
  {
    label: 'Auto',
    value: '',
  },
  {
    label: 'Australia',
    value: 'au1',
  },
  {
    label: 'Brazil',
    value: 'br1',
  },
  {
    label: 'Germany',
    value: 'de1',
  },
  {
    label: 'Ireland',
    value: 'ie1',
  },
  {
    label: 'India',
    value: 'in1',
  },
  {
    label: 'Japan',
    value: 'jp1',
  },
  {
    label: 'Singapore',
    value: 'sg1',
  },
  {
    label: 'US East Coast (Virginia)',
    value: 'us1',
  },
  {
    label: 'US West Coast (Oregon)',
    value: 'us2',
  },
];

export const DOLBY_REGIONS = [
  {
    label: 'Auto',
    value: '',
  },
  {
    label: 'Australia',
    value: 'au',
  },
  {
    label: 'Canada',
    value: 'ca',
  },
  {
    label: 'Europe',
    value: 'eu',
  },
  {
    label: 'India',
    value: 'in',
  },
  {
    label: 'United States',
    value: 'us',
  },
];
