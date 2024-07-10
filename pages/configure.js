import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { Configuration } from 'components/Configuration';
import { Layout } from 'components/Layout';
import { Container } from 'components/ui/Container';

export default function Configure() {
  return (
    <Layout>
      <Container>
        <Configuration />
      </Container>
    </Layout>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login?path=/configure',
});
