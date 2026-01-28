// src/common/ui/hi5Theme.js
import { useCallback, useMemo, useState } from "react";

export const HI5_THEME_KEY = "hi5tech_theme"; // "dark" | "light"

export function getHi5ThemeTokens(mode) {
  const isLight = mode === "light";

  return {
    mode,
    page: {
      color: isLight ? "rgba(10,16,34,0.92)" : "rgba(255,255,255,0.92)",
      background: isLight
        ? `
          radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.20), transparent 60%),
          radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.16), transparent 55%),
          radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.12), transparent 55%),
          linear-gradient(180deg, #F7F9FF 0%, #EEF3FF 55%, #EAF0FF 100%)
        `
        : `
          radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.28), transparent 60%),
          radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.18), transparent 55%),
          radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.10), transparent 55%),
          linear-gradient(180deg, #070A12 0%, #0A1022 45%, #0B1633 100%)
        `,
    },

    glass: {
      border: isLight
        ? "1px solid rgba(10,16,34,0.10)"
        : "1px solid rgba(255,255,255,0.10)",
      bg: isLight
        ? "linear-gradient(135deg, rgba(255,255,255,0.70), rgba(255,255,255,0.40))"
        : "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
      shadow: isLight
        ? "0 18px 55px rgba(10,16,34,0.12)"
        : "0 18px 55px rgba(0,0,0,0.35)",
      divider: isLight ? "rgba(10,16,34,0.10)" : "rgba(255,255,255,0.10)",
    },

    pill: {
      bg: isLight ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.06)",
      border: isLight
        ? "1px solid rgba(10,16,34,0.12)"
        : "1px solid rgba(255,255,255,0.10)",
      text: isLight ? "rgba(10,16,34,0.88)" : "rgba(255,255,255,0.88)",
    },

    buttonOutlined: {
      borderColor: isLight ? "rgba(10,16,34,0.20)" : "rgba(255,255,255,0.18)",
      color: isLight ? "rgba(10,16,34,0.88)" : "rgba(255,255,255,0.88)",
      background: isLight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.04)",
    },
  };
}

function safeGetSavedMode() {
  try {
    const saved = localStorage.getItem(HI5_THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  return "dark";
}

function safeSetSavedMode(mode) {
  try {
    localStorage.setItem(HI5_THEME_KEY, mode);
  } catch {
    // ignore
  }
}

export function useHi5Theme() {
  const [mode, setMode] = useState(() => safeGetSavedMode());

  const tokens = useMemo(() => getHi5ThemeTokens(mode), [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      safeSetSavedMode(next);
      return next;
    });
  }, []);

  const setLight = useCallback(() => {
    safeSetSavedMode("light");
    setMode("light");
  }, []);

  const setDark = useCallback(() => {
    safeSetSavedMode("dark");
    setMode("dark");
  }, []);

  return { mode, tokens, toggleMode, setLight, setDark };
}
