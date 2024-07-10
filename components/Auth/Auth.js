import React, { useCallback, useState } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

export const Auth = ({ view }) => {
  const { supabaseClient } = useSessionContext();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(
    async (values) => {
      setError('');
      setMessage('');

      switch (view) {
        case 'sign_in':
          const { error: signInError } =
            await supabaseClient.auth.signInWithPassword(values);
          if (signInError) setError(signInError.message);
          break;
        case 'sign_up':
          const {
            data: { user: signUpUser, session: signUpSession },
            error: signUpError,
          } = await supabaseClient.auth.signUp(values);
          if (signUpError) setError(signUpError.message);
          // Check if session is null -> email confirmation setting is turned on
          else if (signUpUser && !signUpSession)
            setMessage('Check your email for the confirmation link.');
          break;
      }
    },
    [supabaseClient.auth, view]
  );

  switch (view) {
    case 'sign_in':
      return <SignIn handleSignIn={handleSubmit} error={error} />;
    case 'sign_up':
      return (
        <SignUp handleSignUp={handleSubmit} error={error} message={message} />
      );
    default:
      return null;
  }
};
