module.exports = {
  purge: {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    safelist: [
      "bg-green-100",
      "bg-green-300",
      "bg-green-500",
      "bg-green-700",
      "bg-green-900",
      "text-green-400",
      "text-green-800",
      "bg-red-100",
      "bg-red-300",
      "bg-red-500",
      "bg-red-600",
      "bg-red-900",
      "text-red-400",
      "text-red-800",
      "bg-blue-100",
      "bg-blue-300",
      "bg-blue-500",
      "bg-blue-700",
      "bg-blue-900",
      "text-blue-400",
      "text-blue-800",
      "bg-gray-100",
      "bg-gray-300",
      "bg-gray-500",
      "bg-gray-700",
      "bg-gray-900",
      "text-gray-400",
      "text-gray-800",
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        "40px": "40px",
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
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        ternary: "var(--ternary)",
        main: "#131722",
        sandbox: "#1C2530",
        field: "#2A3441",
        "sf-gray": "#CDD7E3",
        "sf-blue": "#18A2D9",
        dark: "#18181b",
      },
      backgroundColor: (theme) => ({
        "black-sidebar": "#2A3441",
        "blue-primary": "#18A2D9",
      }),
      borderColor: (theme) => ({
        black: "#2A3441",
      }),
      letterSpacing: {
        "widest-1": "0.265em",
      },
      fontSize: {
        xxs: "11px",
        "xxs-2": "0.813rem",
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
