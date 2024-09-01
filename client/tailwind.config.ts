import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          slate: "#020618",
          green: "#062e17",
          yellow: "#432106",
          orange: "#431507",
          pink: "#4c0519",
          blue: "#092f48",
        },
        secondary: {
          slate: "#cfd9e2",
          green: "#337a5f",
          yellow: "#eebd34",
          orange: "#ef5520",
          pink: "#f8bac9",
          blue: "#2274b4",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  mode: 'jit',
  safelist: [
    'bg-primary-slate', 'bg-primary-green', 'bg-primary-yellow', 'bg-primary-orange', 'bg-primary-pink', 'bg-primary-blue',
    'border-secondary-slate', 'border-secondary-green', 'border-secondary-yellow', 'border-secondary-orange', 'border-secondary-pink', 'border-secondary-blue',
    'bg-secondary-slate', 'bg-secondary-green', 'bg-secondary-yellow', 'bg-secondary-orange', 'bg-secondary-pink', 'bg-secondary-blue'
  ],
} satisfies Config;

export default config;
