import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeModeProvider } from "./common/context/ThemeContext";
import { AuthProvider } from "./common/context/AuthContext";
import { TenantProvider } from "./common/context/TenantContext";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
const host = window.location.hostname;

console.log("Detected host:", host);

const renderWithProviders = (AppComponent) => {
  root.render(
    <React.StrictMode>
      <Router>
        <TenantProvider>
          <AuthProvider>
            <ThemeModeProvider>
              <AppComponent />
            </ThemeModeProvider>
          </AuthProvider>
        </TenantProvider>
      </Router>
    </React.StrictMode>
  );
};

// Subdomain routing
if (host.includes("-control.")) {
  import("./control").then(({ default: ControlApp }) => renderWithProviders(ControlApp));
} else if (host.includes("-self.")) {
  import("./selfservice").then(({ default: SelfServiceApp }) => renderWithProviders(SelfServiceApp));
} else if (host.includes("-itsm.")) {
  import("./itsm").then(({ default: ITSMApp }) => renderWithProviders(ITSMApp));
} else {
  // ✅ tenant.hi5tech.co.uk becomes the PORTAL (central login + landing chooser)
  import("./portal").then(({ default: PortalApp }) => renderWithProviders(PortalApp));
}
