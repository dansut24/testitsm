// src/common/ui/hi5Theme.js
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createTheme, alpha, ThemeProvider, CssBaseline } from "@mui/material";

const LS_KEY = "hi5_theme_mode"; // "light" | "dark"

function getInitialMode() {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    // ignore
  }

  // Default to dark (matches your current look)
  return "dark";
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
        // Light mode: still “Hi5”, but clean and readable
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
        chipBg: "rgba(255,255,255,0.06)",
        chipBorder: "1px solid rgba(255,255,255,0.10)",
        outline: "rgba(255,255,255,0.18)",
      }
    : {
        border: "1px solid rgba(10,16,34,0.10)",
        bg: "linear-gradient(135deg, rgba(255,255,255,0.80), rgba(255,255,255,0.55))",
        shadow: "0 18px 55px rgba(10,16,34,0.12)",
        chipBg: "rgba(10,16,34,0.05)",
        chipBorder: "1px solid rgba(10,16,34,0.10)",
        outline: "rgba(10,16,34,0.18)",
      };

  return { mode, page, glass };
}

function buildMuiTheme(tokens) {
  const isDark = tokens.mode === "dark";

  const primaryMain = isDark ? "#7C5CFF" : "#5A3BFF";
  const infoMain = isDark ? "#38BDF8" : "#0284C7";
  const successMain = isDark ? "#22C55E" : "#16A34A";

  const theme = createTheme({
    palette: {
      mode: tokens.mode,
      primary: { main: primaryMain },
      info: { main: infoMain },
      success: { main: successMain },
      background: {
        default: isDark ? "#070A12" : "#F6F8FF",
        paper: isDark ? alpha("#0B1633", 0.65) : alpha("#FFFFFF", 0.8),
      },
      text: {
        primary: isDark ? "rgba(255,255,255,0.92)" : "rgba(10,16,34,0.92)",
        secondary: isDark ? "rgba(255,255,255,0.68)" : "rgba(10,16,34,0.66)",
      },
      divider: isDark ? "rgba(255,255,255,0.10)" : "rgba(10,16,34,0.10)",
    },
    typography: {
      fontFamily:
        'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      h5: { fontWeight: 950 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "transparent",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingLeft: 16,
            paddingRight: 16,
          },
          contained: {
            boxShadow: "none",
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
          notchedOutline: {
            borderColor: tokens.glass.outline,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 900,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(10,16,34,0.10)",
          },
        },
      },
    },
  });

  return theme;
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
    () => ({
      mode,
      setMode,
      toggleMode,
      tokens,
      theme,
    }),
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
  if (!ctx) {
    throw new Error("useHi5Theme must be used inside <Hi5ThemeProvider>.");
  }
  return ctx;
}
