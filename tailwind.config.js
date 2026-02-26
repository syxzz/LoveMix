/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B5CE7',
        secondary: '#1B1F3B',
        accent: '#C9A96E',
        background: '#0C0E1A',
        cardBg: '#1A1F38',
        textDark: '#E8EAF0',
        textGray: '#6B7194',
      },
      borderRadius: {
        'small': '12px',
        'medium': '20px',
        'large': '24px',
        'xlarge': '32px',
      },
      fontFamily: {
        'poppins-bold': ['Poppins-Bold'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-regular': ['Poppins-Regular'],
        'poppins-light': ['Poppins-Light'],
      },
    },
  },
  plugins: [],
}

