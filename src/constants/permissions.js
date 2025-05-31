// Step 1: Create the permissions file

// src/constants/permissions.js

const permissions = {
  Admin: {
    viewIncidents: true,
    createIncident: true,
    viewSettings: true,
    manageUsers: true,
    viewReports: true,
  },
  Technician: {
    viewIncidents: true,
    createIncident: true,
    viewSettings: false,
    manageUsers: false,
    viewReports: true,
  },
  User: {
    viewIncidents: true,
    createIncident: true,
    viewSettings: false,
    manageUsers: false,
    viewReports: false,
  },
};

export default permissions;
