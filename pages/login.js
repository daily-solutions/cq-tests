import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Auth } from 'components/Auth';
import Card from 'components/ui/Card';
import Container from 'components/ui/Container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'components/ui/Tabs';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Login = () => {
  const router = useRouter();
  const user = useUser();
  const [view, setView] = useState('sign_in');

  useEffect(() => {
    if (!user?.id) return;

    if (router.query?.path) {
      router.push(router.query.path);
    } else router.push('/');
  }, [router, user?.id]);

  return (
    <Container css={{ minHeight: '100vh' }}>
      <Image
        src="/robo.svg"
        width="260"
        height="180"
        alt=""
        priority
        style={{ margin: '0 auto 46px auto' }}
      />

      <Card css={{ width: 500, rowGap: '$5' }}>
        <h2>Daily Test Bench</h2>

        <Tabs defaultValue="sign_in">
          <TabsList aria-label="Manage your account">
            <TabsTrigger value="sign_in">Sign in</TabsTrigger>
            <TabsTrigger value="sign_up">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="sign_in">
            <Auth view="sign_in" />
          </TabsContent>
          <TabsContent value="sign_up">
            <Auth view="sign_up" />
          </TabsContent>
        </Tabs>
      </Card>
    </Container>
  );
};

export default Login;
