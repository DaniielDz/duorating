/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: "#0D0D1A",
        "dark-50": "#1A1A2E",
        "dark-100": "#25253D",
        accent: "#4F46E5",
        "accent-secondary": "#C9956B",
        surface: "#1A1A2E",
        "surface-elevated": "#25253D",
        "surface-input": "#1E1E32",
        line: "#2E2E4A",
        "line-focus": "#4F46E5",
        muted: "#6B7280",
        "muted-foreground": "#9CA3AF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
