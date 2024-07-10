import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { Layout } from 'components/Layout';
import { LoadProviders, Provider } from 'components/Provider';
import { Container } from 'components/ui/Container';
import Flex from 'components/ui/Flex';

export default function ProviderPage() {
  return (
    <Layout>
      <Container>
        <Flex css={{ columnGap: '$5' }}>
          <LoadProviders />
          <Provider />
        </Flex>
      </Container>
    </Layout>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login?path=/provider',
});
