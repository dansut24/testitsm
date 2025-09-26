import React from "react";

const Sidebar = ({ sidebarOpen, sidebarPinned, activateOrAddTab, favicons }) => {
  return (
    <div
      className={`sidebar${sidebarOpen || sidebarPinned ? " open" : ""}${
        sidebarPinned ? " pinned" : ""
      }`}
    >
      <div>
        <div className="nav-item" onClick={() => activateOrAddTab("Home", favicons[0])}>
          🏠 <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => activateOrAddTab("Profile", favicons[1])}>
          👤 <span>Profile</span>
        </div>
        <div className="nav-item" onClick={() => activateOrAddTab("Settings", favicons[2])}>
          ⚙️ <span>Settings</span>
        </div>
        <div className="nav-item" onClick={() => activateOrAddTab("Help", favicons[3])}>
          ❓ <span>Help</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
