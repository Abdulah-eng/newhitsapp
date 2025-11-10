import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Soft Navy Blue - Trust, calm, professionalism
        primary: {
          50: "#E8F0F7",
          100: "#D1E1EF",
          200: "#A3C3DF",
          300: "#75A5CF",
          400: "#4787BF",
          500: "#2C5F8D", // Main primary color
          600: "#224B70",
          700: "#183753",
          800: "#0E2336",
          900: "#040F19",
        },
        // Secondary: Warm Light Gray/Beige - Reduces glare, adds warmth
        secondary: {
          50: "#F9F9F8",
          100: "#F5F5F3",
          200: "#E8E6E1",
          300: "#DBD9CF",
          400: "#CECCBD",
          500: "#E8E6E1", // Main secondary color
          600: "#B8B5A5",
          700: "#8B8879",
          800: "#5E5B4D",
          900: "#312E21",
        },
        // Accent: Gentle Teal - Technology and renewal
        accent: {
          50: "#E8F5F3",
          100: "#D1EBE7",
          200: "#A3D7CF",
          300: "#75C3B7",
          400: "#4A9B8E", // Main accent color
          500: "#3B7C72",
          600: "#2C5D56",
          700: "#1D3E3A",
          800: "#0E1F1D",
          900: "#050A09",
        },
        // Text: Dark Gray - Smoother readability
        text: {
          primary: "#2C2C2C",
          secondary: "#4A4A4A",
          tertiary: "#6B6B6B",
          disabled: "#9B9B9B",
        },
        // Status colors (softened for older adults)
        success: {
          50: "#F0F9F0",
          100: "#E1F3E1",
          500: "#5CB85C",
          600: "#4A964A",
          700: "#387438",
        },
        warning: {
          50: "#FDF8F0",
          100: "#FBF1E1",
          500: "#F0AD4E",
          600: "#C08A3E",
          700: "#90672E",
        },
        error: {
          50: "#F9F0F0",
          100: "#F3E1E1",
          500: "#D9534F",
          600: "#AE423F",
          700: "#83312F",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // Larger base font sizes for readability
        xs: ["0.75rem", { lineHeight: "1.5" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.5" }], // 14px
        base: ["1rem", { lineHeight: "1.6" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.6" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.6" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "1.5" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "1.4" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "1.3" }], // 36px
        "5xl": ["3rem", { lineHeight: "1.2" }], // 48px
      },
      spacing: {
        // Larger touch targets (minimum 44x44px for accessibility)
        touch: "2.75rem", // 44px
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(44, 95, 141, 0.1)",
        medium: "0 4px 16px rgba(44, 95, 141, 0.15)",
        large: "0 8px 32px rgba(44, 95, 141, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-out": "fadeOut 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
    },
  },
  plugins: [],
};

export default config;

