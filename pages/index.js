import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import Button from 'components/ui/Button';
import { Container } from 'components/ui/Container';
import { useRouter } from 'next/router';
import RoboLoadSVG from 'public/robo-load.svg';
import RoboNewSVG from 'public/robo-new.svg';
import { styled } from 'styles/stitches.config';
import { Layout } from '../components/Layout';

const StyledOptions = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1px 1fr',
  gridColumnGap: '$5',
  justifyContent: 'center',
  alignContent: 'center',
  width: '960px',

  '& > .divider': {
    backgroundColor: '$slate2',
  },
});

const StyledOption = styled('div', {
  display: 'flex',
  flexFlow: 'column wrap',
  padding: '$5',
  backgroundColor: '$slate2',
  alignItems: 'center',
  br: '$lg',
  color: '$slate1',
  cursor: 'pointer',

  svg: {
    marginBottom: '$5',
  },

  transition: 'all 250ms ease',

  '&:hover': {
    backgroundColor: '$indigo2',
    color: '$indigo11',
  },

  '&:last-of-type:hover': {
    backgroundColor: '$sky2',
    color: '$sky11',
  },
});

export default function Home() {
  const router = useRouter();

  return (
    <Layout>
      <Container>
        <StyledOptions>
          <StyledOption>
            <RoboLoadSVG />
            <Button fullWidth={true} onClick={() => router.push('/load')}>
              Load Previous
            </Button>
          </StyledOption>
          <div className="divider" />
          <StyledOption>
            <RoboNewSVG />
            <Button
              fullWidth={true}
              color="secondary"
              onClick={() => router.push('/configure')}
            >
              Configure New
            </Button>
          </StyledOption>
        </StyledOptions>
      </Container>
    </Layout>
  );
}

export const getServerSideProps = withPageAuth({ redirectTo: '/login' });
