import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeModeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { TenantProvider } from "./context/TenantContext";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <TenantProvider> {/* 🔁 Tenant context from subdomain */}
        <AuthProvider>
          <ThemeModeProvider>
            <App />
          </ThemeModeProvider>
        </AuthProvider>
      </TenantProvider>
    </Router>
  </React.StrictMode>
);
