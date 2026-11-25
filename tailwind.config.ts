import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        aeris: {
          bg: '#060B14',
          card: '#0D1526',
          border: '#1B2845',
        },
      },
    },
  },
  plugins: [],
};

export default config;
