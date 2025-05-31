// Step 2: Create the permission hook

// src/hooks/usePermissions.js
import { useEffect, useState } from "react";
import permissions from "../constants/permissions";

export const usePermissions = () => {
  const [role, setRole] = useState("User");
  const [allowed, setAllowed] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userRole = storedUser?.role || "User";
    setRole(userRole);
    setAllowed(permissions[userRole] || {});
  }, []);

  return { role, allowed };
};
