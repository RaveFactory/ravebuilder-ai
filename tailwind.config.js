/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          purple: "#b026ff",
          pink: "#ff2d95",
          blue: "#00f0ff",
          green: "#39ff14",
        },
        cyber: {
          dark: "#0a0a0f",
          darker: "#050508",
          surface: "#12121a",
          border: "#1e1e2e",
        },
      },
      boxShadow: {
        "neon-purple": "0 0 10px #b026ff, 0 0 40px #b026ff40, 0 0 80px #b026ff20",
        "neon-pink": "0 0 10px #ff2d95, 0 0 40px #ff2d9540, 0 0 80px #ff2d9520",
        "neon-blue": "0 0 10px #00f0ff, 0 0 40px #00f0ff40, 0 0 80px #00f0ff20",
        "neon-green": "0 0 10px #39ff14, 0 0 40px #39ff1440, 0 0 80px #39ff1420",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        glow: {
          "0%": { boxShadow: "0 0 10px #b026ff, 0 0 20px #b026ff40" },
          "100%": { boxShadow: "0 0 20px #b026ff, 0 0 60px #b026ff60" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
