/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
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
