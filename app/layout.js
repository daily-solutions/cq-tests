import Head from 'next/head';

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <Head>
        <title>Daily CQ Sandbox</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
