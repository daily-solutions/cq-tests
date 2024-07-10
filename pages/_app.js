import { useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { TooltipProvider } from 'components/ui/Tooltip';
import Head from 'next/head';

// CSS
import 'normalize.css/normalize.css';
import { globalStyles } from 'styles/stitches.config';

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  globalStyles();

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Head>
        <title>Daily Test Bench</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TooltipProvider delayDuration={0}>
        <Component {...pageProps} />
      </TooltipProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
