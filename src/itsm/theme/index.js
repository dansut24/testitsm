// src/itsm/theme/index.js
import { createTheme } from "@mui/material/styles";

// 🔹 Light Theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

// 🔹 Dark Theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

// 🔹 Vibrant Theme (fun alternative)
export const vibrantTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#e91e63" }, // pink
    secondary: { main: "#9c27b0" }, // purple
    background: { default: "#fff0f6", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

// 🔹 Helper: Get theme object by name
export const getTheme = (mode) => {
  switch (mode) {
    case "dark":
      return darkTheme;
    case "vibrant":
      return vibrantTheme;
    case "light":
    default:
      return lightTheme;
  }
};
