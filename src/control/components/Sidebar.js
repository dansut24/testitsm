import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Devices", path: "/devices" },
    { label: "Reports", path: "/reports" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div style={{
      width: "220px",
      backgroundColor: "#1f2937",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "1rem"
    }}>
      <h2 style={{ color: "#fff" }}>HI5Tech Control</h2>
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            color: location.pathname === item.path ? "#38bdf8" : "#fff",
            textDecoration: "none",
            margin: "1rem 0"
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
