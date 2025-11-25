"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextProps {
  darkMode: boolean;
  primaryColor: string;
  setDarkMode: (value: boolean) => void;
  setPrimaryColor: (value: string) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  darkMode: false,
  primaryColor: "#1E40AF",
  setDarkMode: () => {},
  setPrimaryColor: () => {},
});

export const ThemeProvider = ({ children }: any) => {
  const [darkMode, setDarkModeState] = useState(false);
  const [primaryColor, setPrimaryColorState] = useState("#1E40AF");

  // applique le thème sombre dans le DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // applique la couleur principale dans le DOM
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primaryColor);
  }, [primaryColor]);

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
  };

  const setPrimaryColor = (val: string) => {
    setPrimaryColorState(val);
  };

  return (
    <ThemeContext.Provider
      value={{ darkMode, primaryColor, setDarkMode, setPrimaryColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
