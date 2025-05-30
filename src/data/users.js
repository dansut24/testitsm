// src/data/users.js

const users = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // In production, passwords must be hashed.
    role: "Admin",
    permissions: ["view_dashboard", "manage_incidents", "manage_users"],
  },
  {
    id: 2,
    username: "agent",
    password: "agent123",
    role: "Agent",
    permissions: ["view_dashboard", "manage_incidents"],
  },
  {
    id: 3,
    username: "viewer",
    password: "viewer123",
    role: "Viewer",
    permissions: ["view_dashboard"],
  },
];

export default users;
