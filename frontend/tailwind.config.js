module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        elderBlue: '#e6f0ff',
        primary: '#1e40af',
      },
      fontSize: {
        lg: ['18px', '28px'],
        xl: ['20px', '30px'],
      },
    },
  },
  plugins: [],
}
