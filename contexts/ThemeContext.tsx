import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context
interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the context with a default value of undefined
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Define the ThemeProvider component that will pass the context
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle the theme between dark and light
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context in other components
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
