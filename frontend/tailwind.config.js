/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          kelly: {
            50: '#e6f9f0',   // very light green
            100: '#c2f2dd',  // lighter green
            200: '#8be6c1',  // light green
            300: '#4fd39b',  // medium-light green
            400: '#26b87a',  // medium green
            500: '#009639',  // Kelly green (main)
            550: '#0A8756',
            600: '#007a3d',  // dark Kelly green
            700: '#006333',  // darker green
            800: '#004d29',  // even darker
            900: '#00331a',  // almost black green
            DEFAULT: '#009639',
            dark: '#007A3D',
            light: '#E5F6EF',
          },
          gray: {
            50: '#F5F5F5',
            100: '#E5E5E5',
            200: '#D1D5DB',
            300: '#A1A1AA',
            400: '#737373',
            500: '#525252',
            600: '#404040',
            700: '#262626',
            800: '#171717',
            900: '#222222',
          },
        },
        fontFamily: {
          sans: ['Inter', 'Arial', 'Helvetica Neue', 'sans-serif'],
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          }
        }
      },
    },
    plugins: [],
  }