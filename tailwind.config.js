/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF69B4',
        secondary: '#87CEEB',
        background: '#FFFFFF',
        cardBg: '#F8F9FA',
        textDark: '#2C3E50',
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

