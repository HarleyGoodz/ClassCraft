export function isAdminUser(user) {
  return user?.app_metadata?.role === "admin";
}

export function getUserHomePath(user) {
  return isAdminUser(user) ? "/admin/dashboard" : "/dashboard";
}
