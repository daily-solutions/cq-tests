import React from 'react';
import { PersonIcon } from '@radix-ui/react-icons';
import { useSessionContext } from '@supabase/auth-helpers-react';
import Button from 'components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownLinkItem,
} from 'components/ui/DropdownMenu';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { styled } from 'styles/stitches.config';

const StyledLink = styled(Link, {
  textDecoration: 'none',
  cursor: 'pointer',
  color: '$slate12',
});

const StyledHeader = styled('header', {
  background: '$slate2',
  display: 'flex',
  flexFlow: 'row no-wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid $slate6',

  '.lhs, .rhs': {
    display: 'flex',
    flexFlow: 'row no-wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  '.rhs': {
    paddingRight: '$2',
  },

  '.lhs img': {
    marginRight: '$4',
  },
});

export const Header = () => {
  const router = useRouter();
  const { supabaseClient } = useSessionContext();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  return (
    <StyledHeader>
      <div className="lhs">
        <Image src="/logo.png" alt="Daily" width="58" height="58" priority />
        <StyledLink href="/">Test Bench</StyledLink>
      </div>
      <div className="rhs">
        <DropdownMenu openDelay={0}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" outlined>
              <PersonIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownLinkItem href="/provider">Call providers</DropdownLinkItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleLogout()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </StyledHeader>
  );
};
