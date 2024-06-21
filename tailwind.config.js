/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary))",
          darker: "rgb(var(--color-primary-darker))",
        },

        secondary: {
          DEFAULT: "rgb(var(--color-secondary))",
          darker: "rgb(var(--color-secondary-darker))",
        },

        dark: "rgb(var(--color-dark))",
        black: "rgb(var(--color-black))",

        light: "rgb(var(--color-light))",
        white: "rgb(var(--color-white))",

        danger: "rgb(var(--color-danger))",
        success: "rgb(var(--color-success))",
        warning: "rgb(var(--color-warning))",
      },

      borderRadius: {
        DEFAULT: ".5rem",
      },

      transitionDuration: {
        DEFAULT: ".2s",
      },

      transitionTimingFunction: {
        DEFAULT: "ease-out",
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
  ],
};
