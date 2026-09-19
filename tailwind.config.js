/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        // Phoenix Grid Design System
        "phx-bg":         "#0e1320",
        "phx-bg-deep":    "#090e1b",
        "phx-surface":    "#1a1f2d",
        "phx-surface-hi": "#252a38",
        "phx-border":     "#3b494c",
        "phx-muted":      "#849396",
        "phx-text":       "#dee2f5",
        "phx-cyan":       "#00e5ff",
        "phx-cyan-dim":   "#00daf3",
        "phx-green":      "#3ce36a",
        "phx-amber":      "#FF9F00",
        "phx-red":        "#FF4444",
        "phx-blue":       "#adc6ff",
        "phx-primary":    "#c3f5ff",
        // Legacy Stitch tokens
        "outline":               "#849396",
        "on-surface":            "#dee2f5",
        "surface-container-lowest": "#090e1b",
        "primary":               "#c3f5ff",
        "surface-container-high":"#252a38",
        "on-surface-variant":    "#bac9cc",
        "surface-container-low": "#161b29",
        "primary-fixed-dim":     "#00daf3",
        "outline-variant":       "#3b494c",
        "surface-dim":           "#0e1320",
        "surface":               "#0e1320",
        "surface-variant":       "#303443",
        "surface-container":     "#1a1f2d",
        "primary-container":     "#00e5ff",
        "tertiary-container":    "#49ed72",
        "error-container":       "#93000a",
        "secondary-container":   "#0566d9",
        "secondary":             "#adc6ff",
        "tertiary":              "#b1ffb5",
        "tertiary-fixed-dim":    "#3ce36a",
        "error":                 "#ffb4ab",
        // Semantic aliases
        "accent-data":     "#00e5ff",
        "accent-safe":     "#3ce36a",
        "accent-warning":  "#FF9F00",
        "accent-critical": "#FF4444",
        "background-deep": "#050507",
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in':   'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
