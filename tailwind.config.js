/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#313030",
        "surface-bright": "#3a3939",
        "surface-container": "#201f1f",
        "background": "#131313",
        "tertiary-fixed-dim": "#00daf3",
        "on-background": "#e5e2e1",
        "secondary-fixed-dim": "#c7bfff",
        "tertiary": "#00daf3",
        "outline": "#948da2",
        "on-tertiary": "#00363d",
        "surface": "#131313",
        "error-container": "#93000a",
        "on-surface": "#e5e2e1",
        "surface-variant": "#353534",
        "on-secondary": "#2c148e",
        "on-secondary-fixed": "#180065",
        "surface-container-lowest": "#0e0e0e",
        "primary-fixed": "#e8deff",
        "on-primary": "#370096",
        "on-error-container": "#ffdad6",
        "surface-container-low": "#1c1b1b",
        "primary-container": "#5d21df",
        "on-primary-fixed-variant": "#4f00d0",
        "surface-container-highest": "#353534",
        "secondary-container": "#4635a7",
        "secondary": "#c7bfff",
        "on-primary-fixed": "#20005f",
        "on-surface-variant": "#cbc3d9",
        "error": "#ffb4ab",
        "tertiary-fixed": "#9cf0ff",
        "on-tertiary-fixed": "#001f24",
        "on-tertiary-fixed-variant": "#004f58",
        "on-error": "#690005",
        "surface-container-high": "#2a2a2a",
        "on-secondary-fixed-variant": "#4433a4",
        "primary": "#cdbdff",
        "surface-dim": "#131313",
        "outline-variant": "#494456",
        "inverse-surface": "#e5e2e1",
        "primary-fixed-dim": "#cdbdff",
        "surface-tint": "#cdbdff",
        "tertiary-container": "#005d68",
        "inverse-primary": "#6833ea",
        "on-tertiary-container": "#00dcf5",
        "secondary-fixed": "#e5deff",
        "on-secondary-container": "#b8afff",
        "on-primary-container": "#cebfff"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries')
  ],
}
