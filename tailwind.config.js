/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#F7F6F4',
          100: '#EDECE9',
          200: '#D8D6D2',
          300: '#B5B2AC',
          400: '#8E8A83',
          500: '#6B6660',
          600: '#4D4944',
          700: '#322F2B',
          800: '#1C1A17',
          900: '#0F0E0C',
        },
        gold: {
          50:  '#FAF8F4',
          100: '#F2E9DF',
          200: '#E3D0BC',
          300: '#CEB899',
          400: '#C4A882',
          500: '#A88B65',
          600: '#8C7250',
          700: '#6E593D',
          800: '#50402C',
          900: '#32291B',
        },
        cream: {
          50:  '#FEFCF8',
          100: '#FAF6EE',
          200: '#F3EBD8',
          300: '#E8D9BE',
          400: '#D4BA94',
          500: '#C09A6A',
        },
        warm: {
          50:  '#F9F5F0',
          100: '#F0E8DB',
          200: '#DDD0BC',
          300: '#C4AE8E',
          400: '#A88860',
          500: '#8A6A42',
          600: '#6E5234',
          700: '#543E28',
          800: '#3A2B1C',
          900: '#231A10',
        },
      },
      fontFamily: {
        sans:    ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'utah-gradient': 'linear-gradient(135deg, #0F0E0C 0%, #1C1A17 60%, #322F2B 100%)',
        'gold-gradient': 'linear-gradient(135deg, #A88B65 0%, #C4A882 100%)',
        'warm-gradient': 'linear-gradient(135deg, #231A10 0%, #3A2B1C 60%, #543E28 100%)',
      },
    },
  },
  plugins: [],
};
