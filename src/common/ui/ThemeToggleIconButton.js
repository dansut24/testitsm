// src/common/ui/ThemeToggleIconButton.js
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggleIconButton({ mode, onToggle, tokens }) {
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={onToggle}
        sx={{
          width: 44,
          height: 44,
          borderRadius: 999,
          border: tokens.glass.border,
          background: tokens.glass.bg,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: tokens.glass.shadow,
        }}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
