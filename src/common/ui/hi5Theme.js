// src/common/ui/hi5Theme.js
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme, alpha } from "@mui/material/styles";

const LS_KEY = "hi5_theme_mode"; // "light" | "dark"

function getInitialMode() {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    // ignore
  }
  return "dark"; // keep your current default
}

function buildTokens(mode) {
  const isDark = mode === "dark";

  const page = isDark
    ? {
        color: "rgba(255,255,255,0.92)",
        background: `
          radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.28), transparent 60%),
          radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.18), transparent 55%),
          radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.10), transparent 55%),
          linear-gradient(180deg, #070A12 0%, #0A1022 45%, #0B1633 100%)
        `,
      }
    : {
        color: "rgba(10,16,34,0.92)",
        background: `
          radial-gradient(1000px 700px at 18% 12%, rgba(124, 92, 255, 0.20), transparent 60%),
          radial-gradient(1000px 700px at 85% 18%, rgba(56, 189, 248, 0.18), transparent 55%),
          radial-gradient(900px 700px at 65% 88%, rgba(34, 197, 94, 0.12), transparent 55%),
          linear-gradient(180deg, #F6F8FF 0%, #EEF3FF 45%, #EAF2FF 100%)
        `,
      };

  const glass = isDark
    ? {
        border: "1px solid rgba(255,255,255,0.10)",
        bg: "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
        shadow: "0 18px 55px rgba(0,0,0,0.35)",
        divider: "rgba(255,255,255,0.10)",
        outline: "rgba(255,255,255,0.18)",
      }
    : {
        border: "1px solid rgba(10,16,34,0.10)",
        bg: "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.58))",
        shadow: "0 18px 55px rgba(10,16,34,0.12)",
        divider: "rgba(10,16,34,0.10)",
        outline: "rgba(10,16,34,0.18)",
      };

  const pill = isDark
    ? {
        bg: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        text: "rgba(255,255,255,0.90)",
      }
    : {
        bg: "rgba(10,16,34,0.05)",
        border: "1px solid rgba(10,16,34,0.10)",
        text: "rgba(10,16,34,0.88)",
      };

  const buttonOutlined = isDark
    ? {
        borderColor: "rgba(255,255,255,0.18)",
        color: "rgba(255,255,255,0.88)",
        background: "rgba(255,255,255,0.04)",
      }
    : {
        borderColor: "rgba(10,16,34,0.18)",
        color: "rgba(10,16,34,0.85)",
        background: "rgba(255,255,255,0.50)",
      };

  return { mode, page, glass, pill, buttonOutlined };
}

function buildMuiTheme(tokens) {
  const isDark = tokens.mode === "dark";

  const primaryMain = isDark ? "#7C5CFF" : "#5A3BFF";
  const infoMain = isDark ? "#38BDF8" : "#0284C7";
  const successMain = isDark ? "#22C55E" : "#16A34A";

  return createTheme({
    palette: {
      mode: tokens.mode,
      primary: { main: primaryMain },
      info: { main: infoMain },
      success: { main: successMain },
      background: {
        default: isDark ? "#070A12" : "#F6F8FF",
        paper: isDark ? alpha("#0B1633", 0.65) : alpha("#FFFFFF", 0.85),
      },
      text: {
        primary: isDark ? "rgba(255,255,255,0.92)" : "rgba(10,16,34,0.92)",
        secondary: isDark ? "rgba(255,255,255,0.68)" : "rgba(10,16,34,0.66)",
      },
      divider: tokens.glass.divider,
    },
    typography: {
      fontFamily:
        'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      button: { fontWeight: 900, textTransform: "none" },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "transparent",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 900,
          },
          contained: {
            boxShadow: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 999 },
          notchedOutline: { borderColor: tokens.glass.outline },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 900 },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: tokens.glass.divider },
        },
      },
    },
  });
}

const Hi5ThemeContext = createContext(null);

export function Hi5ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  const toggleMode = useCallback(() => {
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(LS_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const tokens = useMemo(() => buildTokens(mode), [mode]);
  const theme = useMemo(() => buildMuiTheme(tokens), [tokens]);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode, tokens, theme }),
    [mode, toggleMode, tokens, theme]
  );

  return (
    <Hi5ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
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
