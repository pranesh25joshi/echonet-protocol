/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#00FFFF',        // Cyan
        'secondary': '#FF00FF',      // Magenta
        'accent-violet': '#8F00FF',  // Violet
        'background-dark': '#0A0A0A', // Almost black
        'background-light': '#F5F8F8', // Light (rarely used)
        'terminal-green': '#00FF00',
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Fira Code', 'monospace'],
        'techno': ['Rajdhani', 'sans-serif'],
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'mono': ['DM Mono', 'Source Code Pro', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '0px',
        'sm': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        'full': '0px',
      },
      boxShadow: {
        'glow-cyan': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff',
        'glow-magenta': '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff',
        'glow-primary': '0 0 8px 1px rgba(0, 255, 255, 0.5)',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
        'rotate-glow': 'rotate-glow 20s linear infinite',
        'scanline': 'scanline 10s linear infinite',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(0.9)', opacity: '0.7' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        'rotate-glow': {
          '0%': { transform: 'rotate(0deg) scale(0.9)', opacity: '0.5' },
          '50%': { transform: 'rotate(180deg) scale(1)', opacity: '0.7' },
          '100%': { transform: 'rotate(360deg) scale(0.9)', opacity: '0.5' },
        },
        scanline: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
