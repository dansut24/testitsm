// src/config/roles.js
export const roles = {
  Admin: ["view_all", "edit_all", "manage_users", "configure_settings"],
  Agent: ["view_assigned", "edit_assigned", "add_comment"],
  Requester: ["view_own", "raise_request"],
};
