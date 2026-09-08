/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atelier: {
          dark: '#0e0f12',
          black: '#121316',
          charcoal: '#1c1d22',
          gray: '#2c2e36',
          sand: '#e8e2d8',
          bone: '#f5f2eb',
          terracotta: '#a34f35',
          gold: '#c5a880',
          olive: '#4b5320'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        cinzel: ['Cinzel', 'serif']
      },
      letterSpacing: {
        widest: '.2em',
        atelier: '.15em'
      }
    },
  },
  plugins: [],
}
