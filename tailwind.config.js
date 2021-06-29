module.exports = {
  purge: {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    safelist: [
      'bg-green-100',
      'bg-green-300',
      'bg-green-500',
      'bg-green-700',
      'bg-green-900',
      'text-green-400',
      'text-green-800',
      'bg-red-100',
      'bg-red-300',
      'bg-red-500',
      'bg-red-700',
      'bg-red-900',
      'text-red-400',
      'text-red-800',
      'bg-blue-100',
      'bg-blue-300',
      'bg-blue-500',
      'bg-blue-700',
      'bg-blue-900',
      'text-blue-400',
      'text-blue-800',
      'bg-gray-100',
      'bg-gray-300',
      'bg-gray-500',
      'bg-gray-700',
      'bg-gray-900',
      'text-gray-400',
      'text-gray-800',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
