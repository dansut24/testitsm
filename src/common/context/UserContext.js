// src/context/UserContext.js
import React, { createContext, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const currentUser = {
    name: "John Doe",
    role: "Agent", // dynamically set this later from login
  };

  return (
    <UserContext.Provider value={currentUser}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
