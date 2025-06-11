import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeModeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { TenantProvider } from "./context/TenantContext";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const host = window.location.hostname;

if (host === "control.hi5tech.co.uk") {
  // Load the Control Portal
  import("./control/index").then(({ default: ControlApp }) => {
    root.render(
      <React.StrictMode>
        <ControlApp />
      </React.StrictMode>
    );
  });
} else {
  // Load the Main ITSM App
  import("./App").then(({ default: App }) => {
    root.render(
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
  });
}
