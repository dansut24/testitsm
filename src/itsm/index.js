// src/itsm/index.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeModeProvider } from "../common/context/ThemeContext";
import { AuthProvider } from "../common/context/AuthContext";
import { TenantProvider } from "../common/context/TenantContext";
import App from "./App";

const ITSMApp = () => (
  <React.StrictMode>
    <Router>
      <TenantProvider>
        <AuthProvider>
          <ThemeModeProvider>
            <App />
          </ThemeModeProvider>
        </AuthProvider>
      </TenantProvider>
    </Router>
  </React.StrictMode>
);

export default ITSMApp;
