import React, { useCallback, useState } from 'react';
import Button from 'components/ui/Button';
import { Divider } from 'components/ui/Divider';
import Flex from 'components/ui/Flex';
import Input from 'components/ui/Input';
import Well from 'components/ui/Well';
import { Form, Formik, Field } from 'formik';
import * as Yup from 'yup';

const ValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export const SignUp = ({ handleSignUp, error, message }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (values) => {
      setSubmitting(true);
      handleSignUp(values);
      setSubmitting(false);
    },
    [handleSignUp]
  );

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={ValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ dirty, isValid }) => (
        <Form>
          <Flex css={{ flexDirection: 'column', rowGap: '$5' }}>
            {error !== '' && (
              <Well>
                <h3>Error</h3>
                {error}
              </Well>
            )}
            {message !== '' && <Well color="secondary">{message}</Well>}
            <Flex css={{ flexFlow: 'column wrap', rowGap: '$3' }}>
              <label htmlFor="email">Email address</label>
              <Field
                name="email"
                component={Input}
                id="email"
                placeholder="Enter your email address here"
              />
            </Flex>
            <Flex css={{ flexFlow: 'column wrap', rowGap: '$3' }}>
              <label htmlFor="password">Create Password</label>
              <Field
                name="password"
                component={Input}
                id="password"
                type="password"
                placeholder="Enter your password here"
              />
            </Flex>
            <Button
              loading={submitting}
              disabled={!(isValid && dirty)}
              type="submit"
              fullWidth
            >
              Sign up
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};
