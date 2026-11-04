/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3a4d39',
          accent: '#a8b79a',
          'accent-dark': '#8a9b7c',
          highlight: '#b08968',
          'bg-base': '#FAF6F0',
          'bg-alt': '#F4EFEA',
          'text-main': '#2e2a26',
          'text-muted': '#6b6661',
          border: '#E8E0D5',
        }
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['Poppins', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
}

