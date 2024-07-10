import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Divider } from 'components/ui/Divider';
import { Well } from 'components/ui/Well';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { PROVIDER_MAPPING } from '../../utils/constants';
import { FormMaker } from '../FormMaker';

const ValidationSchema = Yup.object().shape({
  provider: Yup.mixed().oneOf(Object.keys(PROVIDER_MAPPING)),
  name: Yup.string().required('Required'),
  config: Yup.object().required('Required'),
});

const handleProviderChange = (e, values, setFieldValue) => {
  switch (e.target.value) {
    case 'daily':
      setFieldValue('config', {
        key: '',
      });
      break;
    case 'agora':
      setFieldValue('config', {
        appID: '',
        appCertificate: '',
      });
      break;
    case 'opentok':
      setFieldValue('config', {
        apiKey: '',
        apiSecret: '',
      });
      break;
    case 'zoom':
      setFieldValue('config', {
        sdkKey: '',
        sdkSecret: '',
      });
      break;
    case 'twilio':
      setFieldValue('config', {
        accountSid: '',
        authToken: '',
        apiKey: '',
        apiSecret: '',
      });
      break;
    case 'livekit':
      setFieldValue('config', {
        apiKey: '',
        apiSecret: '',
        host: '',
      });
      break;
    case 'chime':
      setFieldValue('config', {
        accessKeyId: '',
        secretAccessKey: '',
      });
      break;
    case 'bluejeans':
      setFieldValue('config', {
        username: '',
        password: '',
      });
      break;
    case 'dolby':
      setFieldValue('config', {
        appKey: '',
        appSecret: '',
      });
      break;
    default:
      break;
  }
};

const requiresAPIKeyAndSecret = ['opentok', 'livekit', 'twilio'];

const ProfileFields = [
  {
    name: 'provider',
    label: 'Provider',
    type: 'select',
    options: Object.keys(PROVIDER_MAPPING).map((name) => ({
      label: PROVIDER_MAPPING[name],
      value: name,
    })),
    onChange: handleProviderChange,
  },
  {
    name: 'name',
    label: 'Title',
    required: true,
    type: 'text',
    placeholder: "Alice's Domain",
  },
  {
    name: 'config.key',
    label: 'API Key',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'daily',
  },
  {
    name: 'config.appID',
    label: 'App ID',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'agora',
  },
  {
    name: 'config.appCertificate',
    label: 'App Certificate',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'agora',
  },
  {
    name: 'config.accountSid',
    label: 'Account SID',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'twilio',
  },
  {
    name: 'config.authToken',
    label: 'Auth Token',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'twilio',
  },
  {
    name: 'config.host',
    label: 'Host URL',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'livekit',
  },
  {
    name: 'config.apiKey',
    label: 'API Key',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => requiresAPIKeyAndSecret.includes(values.provider),
  },
  {
    name: 'config.apiSecret',
    label: 'API Secret',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => requiresAPIKeyAndSecret.includes(values.provider),
  },
  {
    name: 'config.sdkKey',
    label: 'Video SDK Key',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'zoom',
  },
  {
    name: 'config.sdkSecret',
    label: 'Video SDK Secret',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'zoom',
  },
  {
    name: 'config.appAccessKey',
    label: 'App Access Key',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === '100ms',
  },
  {
    name: 'config.appSecret',
    label: 'App Secret',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === '100ms',
  },
  {
    name: 'config.accessKeyId',
    label: 'Access Key ID',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'chime',
  },
  {
    name: 'config.secretAccessKey',
    label: 'Secret Access Key',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'chime',
  },
  {
    name: 'config.username',
    label: 'Username / Email',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'bluejeans',
  },
  {
    name: 'config.password',
    label: 'Password',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'bluejeans',
  },
  {
    name: 'config.appKey',
    label: 'App Key',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'dolby',
  },
  {
    name: 'config.appSecret',
    label: 'App Secret',
    required: true,
    type: 'text',
    placeholder: 'Provider specific',
    show: (values) => values.provider === 'dolby',
  },
];

export const Provider = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [createProviderError, setCreateProviderError] = useState(false);

  const user = useUser();

  return (
    <Formik
      initialValues={{
        provider: 'daily',
        name: '',
        config: {
          key: '',
        },
      }}
      validationSchema={ValidationSchema}
      onSubmit={async (values) => {
        setSubmitting(true);

        const res = await fetch('/api/createProvider', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id, ...values }),
        });

        const { error } = await res.json();

        if (error) {
          setSubmitting(false);
          setCreateProviderError(true);
        } else {
          router.push('/configure/');
        }
      }}
    >
      {({ dirty, isValid, setFieldValue, values }) => (
        <Form>
          <Card css={{ width: 560, rowGap: '$5' }}>
            <h2>Configure Provider</h2>

            {createProviderError && (
              <Well>
                <h3>Error</h3>
                An error occurred whilst trying to create the provider. Please
                check your config and try again
              </Well>
            )}

            <FormMaker
              fields={ProfileFields}
              values={values}
              setFieldValue={setFieldValue}
            />
            <Divider />
            <Button
              loading={submitting}
              disabled={!(isValid && dirty)}
              type="submit"
            >
              Create Provider
            </Button>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default Provider;
