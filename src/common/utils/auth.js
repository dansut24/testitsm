// utils/auth.js
export const getCurrentUser = () => {
  const token = sessionStorage.getItem("token");
  const user = sessionStorage.getItem("user");
  return token && user ? JSON.parse(user) : null;
};

export const hasPermission = (perm) => {
  const user = getCurrentUser();
  return user?.permissions?.includes(perm);
};

export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.roles?.includes(role);
};
