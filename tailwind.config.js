/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OBSIDIAN Brand Colors
        primary: {
          DEFAULT: '#ff6b35', // Laranja principal
          50: '#fff5f2',
          100: '#ffe8e0',
          200: '#ffd1c2',
          300: '#ffb59f',
          400: '#ff9270',
          500: '#ff6b35', // Main
          600: '#f54d0f',
          700: '#d63a00',
          800: '#b02f00',
          900: '#8a2500',
        },
        secondary: {
          DEFAULT: '#1a1a1a', // Preto/cinza escuro
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1a1a1a', // Main
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'obsidian': '0 10px 30px rgba(255, 107, 53, 0.2)',
      },
    },
  },
  plugins: [],
};
