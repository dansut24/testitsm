// src/data/workflowTemplates.js

const workflowTemplates = {
  software_installation: [
    {
      title: "Verify software license",
      assignee: "Licensing Team",
      status: "Not Started",
    },
    {
      title: "Install software",
      assignee: "Desktop Support",
      status: "Not Started",
    },
  ],

  new_user_setup: [
    {
      title: "Create Active Directory account",
      assignee: "IT Support",
      status: "Not Started",
    },
    {
      title: "Assign laptop",
      assignee: "Asset Management",
      status: "Not Started",
    },
    {
      title: "Grant access to required systems",
      assignee: "Access Control",
      status: "Not Started",
    },
  ],
};

export default workflowTemplates;
