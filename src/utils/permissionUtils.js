// src/utils/permissionUtils.js
import { roles } from "../config/roles";

export const hasPermission = (userRole, permission) => {
  return roles[userRole]?.includes(permission);
};
