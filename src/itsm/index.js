import React from "react";
import { ThemeModeProvider } from "../common/context/ThemeContext";
import { AuthProvider } from "../common/context/AuthContext";
import { TenantProvider } from "../common/context/TenantContext";
import App from "./App";

const ITSMApp = () => (
  <React.StrictMode>
    <TenantProvider>
      <AuthProvider>
        <ThemeModeProvider>
          <App />
        </ThemeModeProvider>
      </AuthProvider>
    </TenantProvider>
  </React.StrictMode>
);

export default ITSMApp;
