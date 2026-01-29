import React from "react";
import { useAuth } from "../../common/context/AuthContext";

export default function Settings() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    // IMPORTANT: logout() already handles supabase signOut + navigation
    // Avoid double sign-out / double redirects.
    await logout();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Settings</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Signed in as: <strong>{user?.email || "Unknown"}</strong>
      </p>

      <button onClick={handleLogout} style={{ marginTop: 16 }}>
        Logout
      </button>
    </div>
  );
}
