import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeModeProvider } from "./common/context/ThemeContext";
import { AuthProvider } from "./common/context/AuthContext";
import { TenantProvider } from "./common/context/TenantContext";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
const host = window.location.hostname;

console.log("🌐 Detected host:", host);

const renderWithProviders = (AppComponent) => {
  if (!AppComponent) {
    console.error("❌ AppComponent is undefined. Cannot render.");
    return;
  }

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

const loadApp = async () => {
  try {
    if (host.includes("-control.")) {
      const { default: ControlApp } = await import("./control");
      console.log("✅ Loaded Control App");
      renderWithProviders(ControlApp);
    } else if (host.includes("-self.")) {
      const { default: SelfServiceApp } = await import("./selfservice");
      console.log("✅ Loaded Self-Service App");
      renderWithProviders(SelfServiceApp);
    } else if (host.includes("-itsm.")) {
      const { default: ITSMApp } = await import("./itsm");
      console.log("✅ Loaded ITSM App");
      renderWithProviders(ITSMApp);
    } else {
      const { default: MarketingApp } = await import("./main");
      console.log("✅ Loaded Marketing App");
      renderWithProviders(MarketingApp);
    }
  } catch (error) {
    console.error("🚨 Failed to load application module:", error);
    root.render(
      <div style={{ padding: "2rem", color: "#d32f2f", fontFamily: "sans-serif" }}>
        <h2>Something went wrong</h2>
        <p>We couldn’t load the application. Please try again later.</p>
        <pre>{error.message}</pre>
      </div>
    );
  }
};

loadApp();
