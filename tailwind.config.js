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
        /* ===== Obsidian Unified Palette ===== */
        /* Surfaces */
        "background":                "#0e0e0e",
        "surface":                   "#0e0e0e",
        "surface-dim":               "#0e0e0e",
        "surface-bright":            "#2c2c2c",
        "surface-container-lowest":  "#000000",
        "surface-container-low":     "#131313",
        "surface-container":         "#1a1919",
        "surface-container-high":    "#201f1f",
        "surface-container-highest": "#262626",
        "surface-variant":           "#262626",
        "surface-tint":              "#bd9dff",

        /* Primary (Violet) */
        "primary":                   "#bd9dff",
        "primary-dim":               "#8a4cfc",
        "primary-container":         "#b28cff",
        "primary-fixed":             "#b28cff",
        "primary-fixed-dim":         "#a67aff",
        "on-primary":                "#3c0089",
        "on-primary-container":      "#2e006c",
        "on-primary-fixed":          "#000000",
        "on-primary-fixed-variant":  "#390083",
        "inverse-primary":           "#742fe5",

        /* Secondary (Lavender) */
        "secondary":                 "#a28efc",
        "secondary-dim":             "#a28efc",
        "secondary-container":       "#49339d",
        "secondary-fixed":           "#d6cbff",
        "secondary-fixed-dim":       "#c8bbff",
        "on-secondary":              "#21006d",
        "on-secondary-container":    "#d4c9ff",
        "on-secondary-fixed":        "#361c89",
        "on-secondary-fixed-variant":"#533ea7",

        /* Tertiary (Cyan / Pink) */
        "tertiary":                  "#00daf3",
        "tertiary-dim":              "#ef81c4",
        "tertiary-container":        "#005d68",
        "tertiary-fixed":            "#9cf0ff",
        "tertiary-fixed-dim":        "#00daf3",
        "on-tertiary":               "#00363d",
        "on-tertiary-container":     "#00dcf5",
        "on-tertiary-fixed":         "#001f24",
        "on-tertiary-fixed-variant": "#004f58",

        /* Error */
        "error":                     "#ff6e84",
        "error-dim":                 "#d73357",
        "error-container":           "#a70138",
        "on-error":                  "#490013",
        "on-error-container":        "#ffb2b9",

        /* On-Surface & Outlines */
        "on-surface":                "#ffffff",
        "on-background":             "#ffffff",
        "on-surface-variant":        "#adaaaa",
        "outline":                   "#777575",
        "outline-variant":           "#494847",
        "inverse-surface":           "#fcf8f8",
        "inverse-on-surface":        "#565554",
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg":      "2rem",
        "xl":      "3rem",
        "full":    "9999px",
      },
      fontFamily: {
        "headline": ["Inter", "sans-serif"],
        "body":     ["Inter", "sans-serif"],
        "label":    ["Inter", "sans-serif"],
      },
      boxShadow: {
        "glow-primary": "0 0 40px -5px rgba(189, 157, 255, 0.25)",
        "glow-tertiary": "0 0 40px -5px rgba(0, 218, 243, 0.25)",
        "deep": "0 20px 80px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries')
  ],
}
