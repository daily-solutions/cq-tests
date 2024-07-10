import React from 'react';
import { styled } from 'styles/stitches.config';
import { Header } from './Header';

const StyledLayout = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  minHeight: '100vh',
});

export const Layout = ({ children }) => {
  return (
    <StyledLayout>
      <Header />
      {children}
    </StyledLayout>
  );
};
