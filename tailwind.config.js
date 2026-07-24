
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E86024",
          hover: "#D4551E",
          light: "#FFF3ED",
          strong: "#B8460F",
        },
        background: "#FAFAFA",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "text-muted": "#71767F",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
        },
        info: "#2563EB",
        sidebar: "#1F2937",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
