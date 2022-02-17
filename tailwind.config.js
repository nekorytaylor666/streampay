module.exports = {
  purge: {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    safelist: [],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        white: "var(--white)",
        red: "var(--red)",
        blue: "var(--blue)",
        green: "var(--green)",
        yellow: "var(--yellow)",
        gray: "var(--gray)",
        gray: "var(--gray)",
        grayLight: "var(--gray-light)",
        grayDark: "var(--gray-dark)",
        dark: "var(--dark)",
      },
      fontSize: {
        xxs: "11px",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1128px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  variants: {
    extend: {
      backgroundColor: ["active", "hover", "odd"],
      opacity: ["disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
