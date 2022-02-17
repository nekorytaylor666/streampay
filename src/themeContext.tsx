import { createContext, useContext } from "react";

import "./index.css";

export enum Theme {
  Main = "main",
  Dev = "dev",
}

interface ThemeContextInterface {
  theme: Theme;
  setTheme: (Theme: Theme) => void;
}

const emptyTheme = { theme: Theme.Main, setTheme: () => {} };

export const ThemeContext = createContext<ThemeContextInterface>(emptyTheme);

export const useTheme = () => useContext(ThemeContext);

// interface ThemeProps {
//   children: ReactNode;
// }

// const ThemeProvider: FC<ThemeProps> = ({ children }) => {
//   const storedTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : Theme.Main;
//   const [theme, setTheme] = useState(storedTheme);

//   const defaultContext = {
//     theme,
//     setTheme,
//   };

//   return <ThemeContext.Provider value={defaultContext}>{children}</ThemeContext.Provider>;
// };

// export default ThemeProvider;
