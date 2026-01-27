import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeModeProvider } from "./common/context/ThemeContext";
import { AuthProvider } from "./common/context/AuthContext";
import { TenantProvider } from "./common/context/TenantContext";
import "./index.css";

import ShellApp from "./ShellApp";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <TenantProvider>
        <AuthProvider>
          <ThemeModeProvider>
            <ShellApp />
          </ThemeModeProvider>
        </AuthProvider>
      </TenantProvider>
    </Router>
  </React.StrictMode>
);
