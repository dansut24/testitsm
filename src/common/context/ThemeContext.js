// src/context/ThemeContext.js
import React, { createContext, useContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();

const baseThemes = {
  light: {
    palette: {
      mode: "light",
    },
  },
  dark: {
    palette: {
      mode: "dark",
    },
  },
  ocean: {
    palette: {
      mode: "light",
      primary: { main: "#0077b6" },
      secondary: { main: "#90e0ef" },
    },
  },
  forest: {
    palette: {
      mode: "light",
      primary: { main: "#2e7d32" },
      secondary: { main: "#a5d6a7" },
    },
  },
  sunset: {
    palette: {
      mode: "light",
      primary: { main: "#ff6f61" },
      secondary: { main: "#ffc1a1" },
    },
  },
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const theme = useMemo(() => createTheme(baseThemes[mode] || baseThemes.light), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);
