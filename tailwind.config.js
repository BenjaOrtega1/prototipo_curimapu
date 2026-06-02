export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        curimapu: {
          green: '#2f6b3f',
          dark: '#1f3d2b',
          light: '#e7f2e8',
          leaf: '#4f9a5f',
          field: '#f3f7f1',
          wheat: '#f4c95d',
          danger: '#c95656',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
