export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        curimapu: {
          green: 'var(--green-main)',
          dark: 'var(--green-dark)',
          light: 'var(--green-light)',
          leaf: 'var(--border-focus)',
          field: 'var(--gray-bg)',
          wheat: 'var(--yellow-border)',
          danger: 'var(--red-border)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
