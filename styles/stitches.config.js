import { Work_Sans } from '@next/font/google';

import {
  indigoDark,
  skyDark,
  slateDark,
  amberDark,
  crimsonDark,
  grassDark,
} from '@radix-ui/colors';
import { createStitches, globalCss } from '@stitches/react';

const workSans = Work_Sans({ subsets: ['latin'] });

const stitchesConfig = createStitches({
  theme: {
    colors: {
      ...slateDark,
      ...indigoDark,
      ...skyDark,
      ...amberDark,
      ...crimsonDark,
      ...grassDark,
    },
    fonts: {
      sans: '"Work Sans", "Helvetica Neue", Arial, sans-serif',
      serif: '"Work Sans", "Helvetica Neue", Arial, sans-serif',
      mono: '"IBM Plex Mono", "JetBrains Mono", "Fira Code", "Input Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSizes: {
      body: '1rem',
      0: '0.625rem', // 10px
      1: '0.75rem', // 12px
      2: '0.875rem', // 14px
      3: '1rem', // 16px
      4: '1.125rem', // 18px
      5: '1.25rem', // 20px
      6: '1.375rem', // 22px
      7: '1.5rem', // 24px
      8: '1.75rem', // 28px
      9: '2rem', // 32px
      10: '2.25rem', // 36px
      11: '2.625rem', // 42px
      12: '2.875rem', // 46px
      13: '3.1875rem', // 51px
    },
    fontWeights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
      body: '1.625',
      heading: 1.15,
    },
    borderWidths: {
      0: '0px',
      1: '1px',
      2: '2px',
      3: '5px',
      4: '10px',
      5: '25px',
    },
    shadows: {
      none: 'none',
      xs: '0px 5px 2px rgba(26, 21, 35, 0.01), 0px 3px 2px rgba(26, 21, 35, 0.02), 0px 1px 1px rgba(26, 21, 35, 0.03), 0px 0px 1px rgba(26, 21, 35, 0.04), 0px 0px 0px rgba(26, 21, 35, 0.04)',
      sm: '0px 14px 6px rgba(26, 21, 35, 0.01), 0px 8px 5px rgba(26, 21, 35, 0.02), 0px 4px 4px rgba(26, 21, 35, 0.03), 0px 1px 2px rgba(26, 21, 35, 0.04), 0px 0px 0px rgba(26, 21, 35, 0.04)',
      md: '0px 46px 18px rgba(26, 21, 35, 0.01), 0px 26px 16px rgba(26, 21, 35, 0.02), 0px 12px 12px rgba(26, 21, 35, 0.03), 0px 3px 6px rgba(26, 21, 35, 0.04), 0px 0px 0px rgba(26, 21, 35, 0.04)',
      lg: '0px 208px 83px rgba(26, 21, 35, 0.01), 0px 117px 70px rgba(26, 21, 35, 0.03), 0px 52px 52px rgba(26, 21, 35, 0.04), 0px 13px 29px rgba(26, 21, 35, 0.05), 0px 0px 0px rgba(26, 21, 35, 0.05)',
      ringDefault: `0 0 0 3px ${indigoDark.indigo4}`,
      ringPrimary: `0 0 0 3px ${indigoDark.indigo6}`,
    },
    transitions: {
      default: 'all 250ms ease',
      button:
        'background 0.15s ease 0s, color 0.15s ease 0s, border-color 0.15s ease 0s, box-shadow 0.15s ease 0s, transform 0.15s ease 0s, opacity 0.15s ease 0s',
      avatar: 'box-shadow 0.25s ease 0s, opacity 0.25s ease 0s',
      link: 'opacity 0.25s ease 0s, background 0.25s ease 0s',
      card: 'transform 0.25s ease 0s, box-shadow 0.25s ease 0s',
    },
    space: {
      0: '0rem', // 0px
      1: '0.25rem', // 4px
      2: '0.5rem', // 8px
      3: '0.75rem', // 12px
      4: '1rem', // 16px
      5: '1.5rem', // 24px
      6: '2rem', // 32px
      7: '2.5rem', // 40px
      8: '3rem', // 48px
      9: '3.5rem', // 56px
      10: '4rem', // 64px
      11: '8rem', // 128px
      12: '16rem', // 256px
      13: '32rem', // 512px
    },
    sizes: {
      0: '1px',
      1: '5px',
      2: '10px',
      3: '15px',
      4: '20px',
      5: '25px',
      6: '32px',
      7: '44px',
      8: '65px',
      9: '80px',
      10: '90px',
      trayButton: '45px',
      container: '1200px',
    },
    radii: {
      none: '0',
      xs: '4px',
      sm: '6px',
      default: '9px',
      m: '9px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
      round: '50%',
      pill: '9999px',
    },
    zIndices: {
      1: '100',
      2: '200',
      3: '300',
      4: '400',
      max: '999',
    },
  },
  media: {
    bp1: '(min-width: 640px)',
    bp2: '(min-width: 768px)',
    bp3: '(min-width: 1024px)',
  },
  utils: {
    m: (value) => ({
      marginLeft: value,
      marginRight: value,
      marginTop: value,
      marginBottom: value,
    }),
    mx: (value) => ({
      marginLeft: value,
      marginRight: value,
    }),
    ml: (value) => ({
      marginLeft: value,
    }),
    mr: (value) => ({
      marginRight: value,
    }),
    my: (value) => ({
      marginTop: value,
      marginBottom: value,
    }),
    mt: (value) => ({
      marginTop: value,
    }),
    mb: (value) => ({
      marginBottom: value,
    }),
    p: (value) => ({
      paddingLeft: value,
      paddingRight: value,
      paddingTop: value,
      paddingBottom: value,
    }),
    px: (value) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    pl: (value) => ({
      paddingLeft: value,
    }),
    pr: (value) => ({
      paddingRight: value,
    }),
    py: (value) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    pt: (value) => ({
      paddingTop: value,
    }),
    pb: (value) => ({
      paddingBottom: value,
    }),
    bg: (value) => ({
      background: value,
    }),

    // Non-Theme-UI utils
    size: (value) => ({
      width: value,
      height: value,
    }),
    spaceX: (value) => ({
      '& > * + *': {
        marginLeft: value,
      },
    }),
    spaceY: (value) => ({
      '& > * + *': {
        marginTop: value,
      },
    }),
    alignItems: (value) => ({
      alignItems: value,
    }),
    alignItemsCenter: () => ({
      alignItems: 'center',
    }),
    br: (value) => ({
      borderRadius: value,
    }),
  },
});

export const { css, getCssText, styled } = stitchesConfig;

export const globalStyles = globalCss({
  'html, body': {
    minHeight: '100%',
    padding: 0,
    margin: 0,
    fontSize: '$body',
    lineHeight: '$body',
    fontWeight: '$normal',
    fontFamily: '$sans',
    color: '$slate11',
    backgroundColor: '$slate1!important',
  },

  '*, *::before, *::after': {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
    boxSizing: 'border-box',
  },

  // Typography
  'h1, h2, h3, h4, h5': {
    fontWeight: '$300',
    lineHeight: '$tight',
    marginTop: 0,
    marginBottom: '$6',
    color: '$slate12',
  },

  h1: {
    fontSize: '$8',
  },

  h2: {
    fontSize: '$7',
    marginBottom: '$5',
  },

  h3: {
    marginBottom: '$3',
  },

  h4: {
    marginBottom: '$2',
  },

  h5: {
    marginBottom: 0,
    color: '$slate11',
  },

  label: {
    userSelect: 'none',
    color: '$slate12',
    fontWeight: '$medium',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    columnGap: '$2',
    fontSize: '$2',
  },
});

export default stitchesConfig;
