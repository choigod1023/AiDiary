module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      screens: {
        'xs': '375px', // iPhone 13 Pro width
        'mobile': '390px', // iPhone 13 Pro max width
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      height: {
        'screen-mobile': '100dvh', // dynamic viewport height for mobile
        'header-mobile': 'calc(56px + env(safe-area-inset-top, 0px))',
      },
      minHeight: {
        'screen-mobile': '100dvh',
      },
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      padding: {
        'mobile': '1rem',
        'mobile-lg': '1.5rem',
      },
      margin: {
        'mobile': '1rem',
        'mobile-lg': '1.5rem',
      },
    },
  },
  plugins: [],
};
