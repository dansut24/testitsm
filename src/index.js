import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeModeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext"; // ✅ Added import
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap app in AuthProvider */}
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </AuthProvider>
  </React.StrictMode>
);
