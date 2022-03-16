module.exports = {
  mode: "jit",
  purge: {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    safelist: [
      "bg-blue",
      "bg-red",
      "bg-green",
      "bg-yellow",
      "bg-blue-200",
      "bg-red-200",
      "bg-green-200",
      "bg-yellow-200",
      "bg-gray-200",
      "bg-dev-dark-700",
    ],
  },
  devMode: "class",
  theme: {
    extend: {
      width: {
        "40px": "40px",
        "almost-full": "calc(100% - 2rem)",
      },
      height: {
        "40px": "40px",
      },
      maxWidth: {
        "400px": "400px",
      },
      fontFamily: {
        Inter: ["Inter", "sans-serif"],
      },
      colors: {
        white: "var(--white)",
        red: "rgb(var(--red))",
        blue: "rgb(var(--blue))",
        green: "rgb(var(--green))",
        yellow: "var(--yellow)",
        gray: "rgb(var(--gray))",
        "gray-light": "var(--gray-light)",
        "gray-dark": "var(--gray-dark)",
        dark: "rgb(var(--dark))",
        "gray-200": "rgba(var(--gray), 0.2)",
        "blue-200": "rgba(var(--blue), 0.2)",
        "red-200": "rgba(var(--red), 0.2)",
        "green-200": "rgba(var(--green), 0.2)",
        "yellow-200": "rgba(var(--yellow), 0.2)",
        "dev-dark-700": "rgba(var(--dev-dark), 0.7)",
      },
      borderColor: () => ({
        black: "#2A3441",
      }),
      letterSpacing: {
        "widest-1": "0.265em",
      },
      fontSize: {
        h1: ["1.5rem", "2.25rem"],
        h2: ["1.125rem", "2rem"],
        h3: ["1rem", "1.5rem"],
        h4: ["0.875rem", "1.5rem"],
        h5: ["1.5rem", "12.25rem"],
        p: ["1rem", "1.5rem"],
        p2: ["0.875rem", "1.5rem"],
        p3: ["0.75rem", "1.125rem"],
        xxs: "11px", // remove this
        "xxs-2": "0.813rem", // remove this
      },
      width: {
        100: "26rem",
      },
    },
    screens: {
      xs: "320",
      sm: "640px",
      md: "768px",
      lg: "1128px",
      high: { raw: "(min-height: 1234px)" },
    },
  },

  variants: {
    extend: {
      backgroundColor: ["active", "hover", "odd"],
      opacity: ["disabled"],
      textColor: ["group-hover"],
      fill: ["hover", "focus"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
