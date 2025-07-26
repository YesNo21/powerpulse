import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8B5CF6', // Electric purple
          secondary: '#14B8A6', // Bright teal
          accent: '#F59E0B', // Warm orange
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        glow: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config