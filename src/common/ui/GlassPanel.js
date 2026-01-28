// src/common/ui/GlassPanel.js
import React from "react";
import { Paper } from "@mui/material";

export default function GlassPanel({ children, sx, t }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: t?.glass?.border || "1px solid rgba(255,255,255,0.10)",
        background:
          t?.glass?.bg ||
          "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: t?.glass?.shadow || "0 18px 55px rgba(0,0,0,0.35)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
