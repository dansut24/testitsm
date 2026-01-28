// src/common/ui/ThemeToggleIconButton.js
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggleIconButton({ mode, onToggle, t }) {
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light" : "Switch to dark"}>
      <IconButton
        onClick={onToggle}
        sx={{
          borderRadius: 999,
          border: `1px solid ${t.buttonOutlined.borderColor}`,
          color: t.buttonOutlined.color,
          background: t.buttonOutlined.background,
        }}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
