import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { Layout } from 'components/Layout';
import { LoadTest } from 'components/LoadTest';
import { Container } from 'components/ui/Container';

export default function Load() {
  return (
    <Layout>
      <Container>
        <LoadTest />
      </Container>
    </Layout>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login?path=/load',
});
