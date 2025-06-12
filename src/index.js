import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeModeProvider } from "./common/context/ThemeContext";
import { AuthProvider } from "./common/context/AuthContext";
import { TenantProvider } from "./common/context/TenantContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
const host = window.location.hostname;

console.log("Detected host:", host);

const renderWithProviders = (AppComponent) => {
  root.render(
    <React.StrictMode>
      <TenantProvider>
        <AuthProvider>
          <ThemeModeProvider>
            <AppComponent />
          </ThemeModeProvider>
        </AuthProvider>
      </TenantProvider>
    </React.StrictMode>
  );
};

if (host.includes("-control.")) {
  import("./control").then(({ default: ControlApp }) => {
    renderWithProviders(ControlApp);
  });
} else if (host.includes("-self.")) {
  import("./selfservice").then(({ default: SelfServiceApp }) => {
    renderWithProviders(SelfServiceApp);
  });
} else if (host.includes("-itsm.")) {
  import("./itsm").then(({ default: ITSMApp }) => {
    renderWithProviders(ITSMApp);
  });
} else {
  import("./main").then(({ default: MarketingApp }) => {
    renderWithProviders(MarketingApp);
  });
}
