import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand-primary)",
          primary: "var(--brand-primary)",
          "primary-dark": "var(--brand-primary-dark)",
          "primary-light": "var(--brand-primary-light)",
          accent: "var(--brand-accent)",
          "accent-dark": "var(--brand-accent-dark)",
          "accent-soft": "var(--brand-accent-soft)",
        },
        bg: {
          base: "var(--bg-base)",
          soft: "var(--bg-soft)",
          mist: "var(--bg-mist)",
          app: "var(--bg-app)",
          elevated: "var(--bg-elevated)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        // shadcn-compatible aliases
        input: "var(--border)",
        ring: "var(--brand-accent)",
        primary: {
          DEFAULT: "var(--brand-primary)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--bg-mist)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--bg-mist)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--brand-accent-soft)",
          foreground: "var(--brand-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-base)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--bg-base)",
          foreground: "var(--text-primary)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        cta: "0 8px 20px rgba(13, 59, 102, 0.25)",
        accent: "0 8px 20px rgba(64, 224, 208, 0.35)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "glow-brand": "var(--shadow-glow-brand)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        snappy: "cubic-bezier(0.16, 1, 0.3, 1)",
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
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "bg-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.55" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scale-in 0.26s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-right": "slide-in-right 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        "bg-pan": "bg-pan 8s ease-in-out infinite",
        "soft-pulse": "soft-pulse 2s cubic-bezier(0.65, 0, 0.35, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
