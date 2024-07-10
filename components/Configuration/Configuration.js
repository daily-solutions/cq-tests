import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/ui/Accordion';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Divider } from 'components/ui/Divider';
import { Well } from 'components/ui/Well';
import { Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { styled } from 'styles/stitches.config';
import {
  AGORA_REGIONS,
  DAILY_REGIONS,
  HMS_REGIONS,
  PROVIDER_RECEIVE,
  PROVIDER_MAPPING,
  CHIME_REGIONS,
  TWILIO_REGIONS,
  PROVIDER_SIMULCAST,
  DOLBY_REGIONS,
} from 'utils/constants';
import * as Yup from 'yup';
import { FormMaker } from '../FormMaker';

const ValidationSchema = Yup.object().shape({
  provider: Yup.mixed().oneOf(Object.keys(PROVIDER_MAPPING)),
  meetingID: Yup.string().when('providerProfile', {
    is: 'custom',
    then: Yup.string().required('Required'),
  }),
  totalCount: Yup.number().min(2).required('Required'),
  videoConstraints: Yup.object().required('Required'),
  videoCodec: Yup.string().oneOf(['vp8', 'h264']).required('Required'),
  durationInSecs: Yup.number().min(30).required(),
  simulcast: Yup.array().of(
    Yup.object().shape({
      downscale: Yup.number().required(),
    })
  ),
  enableSimulcast: Yup.boolean(),
  ils: Yup.boolean(),
  region: Yup.string(),
  meshSFU: Yup.boolean(),
  receiveSettingsLow: Yup.number().min(1),
  receiveSettingsMid: Yup.number().min(1),
  sendSettingsHigh: Yup.number().min(1),
  sendSettingsLow: Yup.number().min(1),
});

const StyledLink = styled(Link, {
  textDecoration: 'underline',
  cursor: 'pointer',
  color: '$slate11',
});

const StyledCreateProfile = styled('span', {
  fontSize: '$1',
  color: '$slate9',
  lineHeight: 1,
  'a, a:active, a:visited, a:hover': {
    color: '$slate9',
  },
});

export const Configuration = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [createTestError, setCreateTestError] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [provider, setProvider] = useState('daily');

  useEffect(() => {
    const getProfiles = async () => {
      const res = await fetch('/api/loadProviders');
      const { data } = await res.json();
      setProfiles(data);
    };

    getProfiles().catch(console.error);
  }, []);

  const handleCreateRooms = async (values) => {
    const createRoomsRes = await fetch('/api/createTest', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile:
          values.providerProfile === 'custom' ? null : values.providerProfile,
        config: values,
      }),
    });
    const { error, uuid } = await createRoomsRes.json();
    return { error, uuid };
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);

    let roomResult = await handleCreateRooms(values);

    if (roomResult.error) {
      setSubmitting(false);
      setCreateTestError(true);
      return;
    }
    await router.push(`/${roomResult.uuid}`);
  };

  const providerProfiles = useMemo(
    () => profiles.filter((p) => p.provider === provider),
    [provider, profiles]
  );

  const fields = [
    {
      name: 'provider',
      label: 'Provider',
      type: 'select',
      options: Object.keys(PROVIDER_MAPPING).map((name) => ({
        label: PROVIDER_MAPPING[name],
        value: name,
      })),
      onChange: (e) => setProvider(e.target.value),
    },
    {
      name: 'providerProfile',
      label: 'Provider Profile',
      subText: (
        <StyledCreateProfile>
          <StyledLink href="/provider">Create provider profile</StyledLink> to
          auto generate rooms
        </StyledCreateProfile>
      ),
      type: 'select',
      disabled: providerProfiles.length === 0,
      options: [
        { label: 'Custom', value: 'custom' },
        ...providerProfiles.map((p) => ({
          label: p.name,
          value: p.id,
        })),
      ],
      show: (values) => Object.keys(PROVIDER_MAPPING).includes(values.provider),
    },
    {
      name: 'divider',
      type: 'divider',
    },
    {
      name: 'totalCount',
      label: 'Total count of participants',
      type: 'number',
      required: true,
      placeholder: 'Total count of participants for the test',
    },
    {
      name: 'appID',
      label: 'App ID',
      type: 'text',
      required: true,
      placeholder: 'Agora App ID',
      show: (values) =>
        values.provider === 'agora' && values.providerProfile === 'custom',
    },
    {
      name: 'domain',
      label: 'Domain',
      type: 'text',
      required: true,
      placeholder: 'Daily Domain Name',
      show: (values) =>
        values.provider === 'daily' && values.providerProfile === 'custom',
    },
    {
      name: 'meetingID',
      label: 'Meeting ID',
      type: 'text',
      required: true,
      placeholder: 'Meeting / Room / Session ID',
      show: (values) => values.providerProfile === 'custom',
    },
    {
      name: 'token',
      label: 'Token',
      type: 'text',
      required: true,
      placeholder: 'Provider specific',
      show: (values) => values.providerProfile === 'custom',
    },
  ];

  const testFields = [
    {
      name: 'ils',
      label: 'Enable ILS mode',
      type: 'switch',
      defaultChecked: false,
      disabled: !Object.keys(PROVIDER_MAPPING).includes(provider),
    },
    {
      name: 'videoConstraints',
      label: 'Video Constraints',
      type: 'videoConstraints',
    },
    {
      name: 'videoCodec',
      label: 'Video Codec',
      type: 'select',
      options: [
        {
          label: 'VP8',
          value: 'vp8',
        },
        {
          label: 'H264',
          value: 'h264',
        },
      ],
    },
    {
      name: 'frameRate',
      label: 'Frame Rate',
      type: 'number',
      show: (values) => values.provider === 'agora',
    },
    {
      name: 'durationInSecs',
      label: 'Duration (in seconds)',
      type: 'number',
      required: true,
      placeholder: 'Duration of the test',
    },
    {
      name: 'receiveSettings',
      label: 'Use receive settings',
      type: 'switch',
      inputHelper: 'Will reduce layer based on number of offscreen tiles',
      defaultChecked: true,
      disabled: PROVIDER_RECEIVE[provider].length === 0,
    },
    {
      name: 'receiveSettingsFields',
      type: 'receiveSettings',
      show: (values) => values.receiveSettings,
    },
    {
      name: 'switchLayersBasedOnNetwork',
      label: 'Switch layers based on network quality',
      type: 'switch',
      inputHelper: 'Will switch layers based on network quality',
      defaultChecked: true,
      disabled: PROVIDER_RECEIVE[provider].length === 0,
      show: (values) => values.receiveSettings,
    },
    {
      name: 'sendSideSettings',
      label: 'Use send side settings',
      type: 'switch',
      inputHelper: 'Will set bandwidth cap according to the network quality',
      defaultChecked: true,
    },
    {
      name: 'sendSideSettingsFields',
      type: 'sendSideSettings',
      show: (values) => values.sendSideSettings,
    },
  ];

  const simulcastFields = [
    {
      name: 'enableSimulcast',
      label: 'Enable simulcast settings',
      type: 'switch',
      defaultChecked: true,
      disabled: (values) => PROVIDER_SIMULCAST[values.provider] === 0,
    },
    {
      name: 'customSimulcast',
      label: 'Use custom simulcast settings',
      type: 'switch',
      defaultChecked: false,
      disabled: (values) =>
        PROVIDER_SIMULCAST[values.provider] === 0 || !values.enableSimulcast,
    },
    {
      name: 'customSimulcastFields',
      type: 'customSimulcast',
      show: (values) => values.customSimulcast,
    },
  ];

  const advancedFields = [
    {
      name: 'meshSFU',
      label: 'Use Mesh SFU',
      type: 'switch',
      inputHelper: 'Will use multiple SFUs according to participant regions',
      defaultChecked: false,
      disabled: (values) => values.providerProfile === 'custom',
      show: (values) => values.provider === 'daily',
    },
    {
      name: 'region',
      label: 'Region',
      type: 'select',
      options:
        provider === 'agora'
          ? AGORA_REGIONS
          : provider === '100ms'
          ? HMS_REGIONS
          : provider === 'chime'
          ? CHIME_REGIONS
          : provider === 'twilio'
          ? TWILIO_REGIONS
          : provider === 'dolby'
          ? DOLBY_REGIONS
          : DAILY_REGIONS,
      disabled: (values) =>
        values.providerProfile === 'custom' || values.meshSFU,
    },
  ];

  const leaveFields = [
    {
      name: 'leaveOnElapsed',
      label: 'Leave when elapsed',
      type: 'switch',
      defaultChecked: false,
    },
  ];

  return (
    <Formik
      initialValues={{
        provider: 'daily',
        providerProfile: 'custom',
        appID: '',
        domain: '',
        meetingID: '',
        token: '',
        totalCount: 2,
        frameRate: 30,
        durationInSecs: 60,
        enableSimulcast: true,
        customSimulcast: false,
        simulcast: [],
        receiveSettings: true,
        receiveSettingsMid: 5,
        receiveSettingsLow: 9,
        switchLayersBasedOnNetwork: true,
        sendSideSettings: true,
        sendSettingsHigh: 980,
        sendSettingsLow: 300,
        leaveOnElapsed: false,
        videoConstraints: { width: 1280, height: 720 },
        videoCodec: 'vp8',
        meshSFU: false,
        region: '',
      }}
      validationSchema={ValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ dirty, isValid, setFieldValue, values }) => (
        <Form>
          <Card css={{ width: 560, rowGap: '$5' }}>
            <h2>Configure New Test</h2>

            {createTestError && (
              <Well>
                <h3>Error</h3>
                An error occurred whilst trying to create the test. Please check
                your config and try again
              </Well>
            )}

            <FormMaker
              values={values}
              fields={fields}
              setFieldValue={setFieldValue}
            />

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Test options</AccordionTrigger>
                <AccordionContent>
                  <FormMaker
                    values={values}
                    fields={testFields}
                    setFieldValue={setFieldValue}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Simulcast</AccordionTrigger>
                <AccordionContent>
                  <FormMaker
                    fields={simulcastFields}
                    values={values}
                    setFieldValue={setFieldValue}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Advanced</AccordionTrigger>
                <AccordionContent>
                  <FormMaker
                    fields={advancedFields}
                    values={values}
                    setFieldValue={setFieldValue}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Divider />

            <FormMaker
              fields={leaveFields}
              values={values}
              setFieldValue={setFieldValue}
            />
            <Divider />
            <Button
              loading={submitting}
              disabled={!(isValid && dirty)}
              type="submit"
            >
              Create Test
            </Button>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default Configuration;
