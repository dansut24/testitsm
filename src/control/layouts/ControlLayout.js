import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const ControlLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ControlLayout;
