// src/common/ui/Hi5ThemeProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

// Context
const Hi5ThemeContext = createContext(null);

export function Hi5ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("hi5_theme_mode") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("hi5_theme_mode", mode);
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  // Tokens (your glass + page backgrounds)
  const tokens = useMemo(() => {
    const isDark = mode === "dark";

    const pageBg = isDark
      ? `
        radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.28), transparent 60%),
        radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.18), transparent 55%),
        radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.10), transparent 55%),
        linear-gradient(180deg, #070A12 0%, #0A1022 45%, #0B1633 100%)
      `
      : `
        radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.12), transparent 60%),
        radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.10), transparent 55%),
        radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.08), transparent 55%),
        linear-gradient(180deg, #F8FAFF 0%, #EEF3FF 45%, #EAF2FF 100%)
      `;

    return {
      isDark,
      page: {
        background: pageBg,
        color: isDark ? "rgba(255,255,255,0.92)" : "rgba(2,6,23,0.92)",
      },
      glass: {
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(15,23,42,0.10)",
        divider: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)",
        bg: isDark
          ? "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))"
          : "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.55))",
        shadow: isDark ? "0 18px 55px rgba(0,0,0,0.35)" : "0 18px 55px rgba(2,6,23,0.12)",
      },
      pill: {
        bg: isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.04)",
        border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(2,6,23,0.08)",
        text: isDark ? "rgba(255,255,255,0.85)" : "rgba(2,6,23,0.78)",
      },
      buttonOutlined: {
        borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(2,6,23,0.14)",
        color: isDark ? "rgba(255,255,255,0.88)" : "rgba(2,6,23,0.82)",
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
      },
      iconFg: isDark ? "rgba(255,255,255,0.82)" : "rgba(2,6,23,0.76)",
    };
  }, [mode]);

  // MUI theme (keeps your components consistent)
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: { main: "#7C5CFF" },
        secondary: { main: "#38BDF8" },
        background: {
          default: mode === "dark" ? "#070A12" : "#F4F7FF",
          paper: mode === "dark" ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.80)",
        },
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
      },
    });
  }, [mode]);

  const value = useMemo(
    () => ({ mode, toggleMode, tokens }),
    [mode, tokens]
  );

  return (
    <Hi5ThemeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Hi5ThemeContext.Provider>
  );
}

export function useHi5Theme() {
  const ctx = useContext(Hi5ThemeContext);
  if (!ctx) throw new Error("useHi5Theme must be used within <Hi5ThemeProvider>.");
  return ctx;
}
