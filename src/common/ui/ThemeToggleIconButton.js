// src/common/ui/ThemeToggleIconButton.js
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggleIconButton({ mode, onToggle, t, tokens }) {
  const tok = t || tokens || {};
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={onToggle}
        sx={{
          width: 44,
          height: 44,
          borderRadius: 999,
          border: tok?.glass?.border || "1px solid rgba(255,255,255,0.10)",
          background:
            tok?.glass?.bg ||
            "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: tok?.glass?.shadow || "0 18px 55px rgba(0,0,0,0.35)",
        }}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
