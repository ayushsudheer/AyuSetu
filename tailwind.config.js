/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: "#eef2f8",
          surface: "#f3f6fb",
          dark: "#a3b1c6",
          light: "#ffffff",
          text: "#2d3748",
          muted: "#64748b",
          primary: "#4f46e5",
          primaryHover: "#4338ca",
          accent: "#7c3aed",
          accentHover: "#6d28d9",
        },
      },
      boxShadow: {
        "neu-flat": "8px 8px 18px rgba(163, 177, 198, 0.45), -8px -8px 18px rgba(255, 255, 255, 0.9)",
        "neu-flat-sm": "4px 4px 10px rgba(163, 177, 198, 0.35), -4px -4px 10px rgba(255, 255, 255, 0.85)",
        "neu-flat-lg": "12px 12px 28px rgba(163, 177, 198, 0.5), -12px -12px 28px rgba(255, 255, 255, 0.95)",
        "neu-pressed": "inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
        "neu-pressed-sm": "inset 2px 2px 5px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.9)",
        "neu-convex": "6px 6px 14px rgba(163, 177, 198, 0.4), -6px -6px 14px rgba(255, 255, 255, 0.9)",
        "neu-glow": "0 0 20px rgba(79, 70, 229, 0.35)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
