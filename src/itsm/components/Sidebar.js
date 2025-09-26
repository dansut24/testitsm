// Sidebar.js
import React, { useState } from "react";

const Sidebar = ({ activateOrAddTab, favicons }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <>
      {/* Logo toggle */}
      <div className="navbar-logo" onClick={toggleSidebar}>
        <img
          src="https://www.bing.com/sa/simg/favicon-2x.ico"
          alt="Logo"
          style={{ width: 28, height: 28 }}
        />
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar${sidebarOpen || sidebarPinned ? " open" : ""}${
          sidebarPinned ? " pinned" : ""
        }`}
      >
        <div>
          <div className="nav-item" onClick={() => activateOrAddTab("Dashboard", favicons?.[0])}>
            🏠 <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Incidents", favicons?.[1])}>
            🚨 <span>Incidents</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Service Requests", favicons?.[2])}>
            📩 <span>Service Requests</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Changes", favicons?.[3])}>
            ♻️ <span>Changes</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Problems", favicons?.[0])}>
            ❗ <span>Problems</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Assets", favicons?.[1])}>
            💻 <span>Assets</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Knowledge Base", favicons?.[2])}>
            📚 <span>Knowledge Base</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Reports", favicons?.[3])}>
            📊 <span>Reports</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Approvals", favicons?.[0])}>
            ✅ <span>Approvals</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Profile", favicons?.[1])}>
            👤 <span>Profile</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Settings", favicons?.[2])}>
            ⚙️ <span>Settings</span>
          </div>
          <div className="nav-item" onClick={() => activateOrAddTab("Help", favicons?.[3])}>
            ❓ <span>Help</span>
          </div>
        </div>

        {/* Sidebar pin option */}
        <div style={{ padding: "8px 16px" }}>
          <label>
            <input
              type="checkbox"
              checked={sidebarPinned}
              onChange={(e) => setSidebarPinned(e.target.checked)}
            />
            Always show sidebar
          </label>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
