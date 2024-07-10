import React, { useCallback, useEffect, useState } from 'react';
import { CircleBackslashIcon } from '@radix-ui/react-icons';
import Button from 'components/ui/Button';
import Card from 'components/ui/Card';
import Loader from 'components/ui/Loader';
import moment from 'moment';
import { styled } from 'styles/stitches.config';
import { PROVIDER_MAPPING } from 'utils/constants';

const StyledGrid = styled('div', {
  fontSize: '$2',
  border: '1px solid $slate6',
  br: '$default',
  overflow: 'hidden',
  width: '100%',

  '.row, & > header': {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    padding: '$2 $2 $2 $3',
    alignItems: 'center',
    borderBottom: '1px solid $slate6',
  },

  '& > header': {
    color: '$slate12',
    fontWeight: '$medium',
    py: '$4',
    lineHeight: 1,
    backgroundColor: '$slate3',
  },

  '.row:last-child': {
    borderBottom: '0px',
  },

  '.row:nth-child(even)': {
    background: '$slate1',
  },

  '.row > .fit': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const StyledBlankSlate = styled('div', {
  div: {
    width: 42,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '$slate2',
    br: '$sm',
    marginBottom: '$4',
    color: '$slate11',
  },
  color: '$slate8',
  backgroundColor: '$slate3',
  br: '$default',
  padding: '$4',
});

export const LoadProviders = () => {
  const [fetching, setFetching] = useState(true);
  const [profiles, setProfiles] = useState([]);

  const getProfiles = useCallback(async () => {
    const res = await fetch('/api/loadProviders');
    const { data } = await res.json();
    setProfiles(data);
    setFetching(false);
  }, []);

  const handleDeleteProfile = useCallback(
    (id) => {
      const deleteProfile = async () => {
        await fetch('/api/deleteProvider', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
      };

      deleteProfile()
        .then(() => getProfiles())
        .catch(console.error);
    },
    [getProfiles]
  );

  useEffect(() => {
    getProfiles().catch(console.error);
  }, [getProfiles]);

  return (
    <Card css={{ width: 560, rowGap: '$5' }}>
      <h2>Provider Profiles</h2>
      {fetching ? (
        <Loader />
      ) : !profiles || profiles?.length === 0 ? (
        <StyledBlankSlate>
          <div>
            <CircleBackslashIcon />
          </div>
          No profiles found, create one now?
        </StyledBlankSlate>
      ) : (
        <StyledGrid>
          <header>
            <div>Name</div>
            <div>Provider</div>
            <div>Created</div>
            <div />
          </header>
          {profiles.map((profile, index) => (
            <div key={`profile-${index}`} className="row">
              <div>{profile.name}</div>
              <div>{PROVIDER_MAPPING[profile.provider]}</div>
              <div>{moment(profile.created_at).format('MMM Do YY, HH:MM')}</div>
              <div className="fit" style={{ justifyContent: 'end' }}>
                <Button
                  size="small"
                  onClick={() => handleDeleteProfile(profile.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </StyledGrid>
      )}
    </Card>
  );
};
