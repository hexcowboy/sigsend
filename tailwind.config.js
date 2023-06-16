/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          "0%": {
            transform: "translateY(100%)",
          },
          "100%": {
            transform: "translateY(0)",
          },
        },
        fadeIn: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
      },

      animation: {
        modal:
          "slideUp 350ms cubic-bezier(.15,1.15,0.6,1.00), fadeIn 150ms ease",
      },

      backgroundImage: {
        hero: "url('/hero.svg')",
        rainbow:
          "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)",
      },

      height: {
        screen: ["100dvh", "100vh"],
      },

      minHeight: {
        screen: ["100dvh", "100vh"],
      },
    },

    fontFamily: {
      sans: [
        "SF Pro Rounded",
        "ui-rounded",
        "SF Pro Rounded",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica",
        "Arial",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
      ],
      mono: ["SF Mono", "ui-monospace", "SFMono-Regular", "monospace"],
    },
  },
  plugins: [require("tailwindcss-animate")],
};
