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
        // Urbane Bronze family — warm dark charcoal (replaces navy)
        navy: {
          50:  '#F5F4F2',
          100: '#E9E7E4',
          200: '#D0CEC9',
          300: '#ACA8A1',
          400: '#857F77',
          500: '#65615A',
          600: '#504D46',
          700: '#46433E',  // Urbane Bronze SW 7048
          800: '#312F2B',
          900: '#1E1C19',  // deep warm near-black
        },
        // Decorous Amber family — warm leather amber (replaces gold/terracotta)
        gold: {
          50:  '#FCF2E9',
          100: '#F5D9BB',
          200: '#EABB87',
          300: '#DB9550',
          400: '#CE7A2D',
          500: '#C27320',
          600: '#B8692B',  // Decorous Amber SW 6141 — PRIMARY
          700: '#93521A',
          800: '#6E3C0E',
          900: '#4A2807',
        },
        // Alabaster + Nomadic Desert family — warm whites and sand (replaces cream)
        cream: {
          50:  '#F2EFE2',  // Alabaster SW 7008 — main background
          100: '#EAE4D4',  // warm off-white
          200: '#D8CEB8',  // light sand
          300: '#C4AA85',  // Nomadic Desert SW 6107
          400: '#A88B63',
          500: '#8B6E44',
        },
        // Sage — muted sage green accent
        sage: {
          50:  '#F0F2ED',
          100: '#D8DDD3',
          200: '#BCC3B5',
          300: '#AAAF9E',
          400: '#98A086',  // Sage Green #98A086 — hero bg
          500: '#7A8268',
          600: '#5F6651',
          700: '#474D3C',
          800: '#303428',
          900: '#1C1E17',
        },
      },
      fontFamily: {
        sans:    ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        serif:   ['var(--font-fraunces)', 'Georgia', 'serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'utah-gradient': 'linear-gradient(135deg, #1E1C19 0%, #312F2B 60%, #46433E 100%)',
        'gold-gradient': 'linear-gradient(135deg, #93521A 0%, #B8692B 100%)',
        'sage-gradient': 'linear-gradient(135deg, #393D38 0%, #788176 100%)',
      },
    },
  },
  plugins: [],
};
