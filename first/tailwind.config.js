/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'web-indigo': '#4D4AEA',
        'web-indigo-light': '#DCDBFA',
        'web-border': '#F5F0F0',
        'web-text': '#9197B3',
        'web-secondary-button-border': '#E0E0E0',
        'web-secondary-button-text': '#020202',
        'web-primary-button-bg': '#4D4AEA',
        'web-gray-divider': '#444444'
      },
      keyframes: {
        'tilt-shake': {
          '0%': { transform: 'rotate(7deg)' },
          '20%': { transform: 'rotate(-7deg)' },
          '40%': { transform: 'rotate(5deg)' },
          '60%': { transform: 'rotate(-5deg)' },
          '80%': { transform: 'rotate(3deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'tilt-shake-once': 'tilt-shake 0.7s ease-in-out 1',
        'fade-in': 'fade-in 0.3s ease-in-out'
      }
    }
  },
  plugins: []
};
