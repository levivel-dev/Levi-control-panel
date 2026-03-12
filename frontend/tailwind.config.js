/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        ink: '#0B0F14',
        panel: '#111723',
        panelLight: '#161F2E',
        accent: '#4FD1C5',
        accentSoft: '#2A8C84',
        highlight: '#F6C453'
      },
      boxShadow: {
        glow: '0 0 24px rgba(79, 209, 197, 0.25)'
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top, rgba(79, 209, 197, 0.18), transparent 55%)',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
