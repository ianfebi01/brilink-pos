export const ROLES = {
  SUPERADMIN : "superadmin",
  ADMIN      : "admin", // Staff
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROUTE_PERMISSIONS = {
  [ROLES.SUPERADMIN] : ["/", "/transactions", "/fee-rules", "/investments"],
  [ROLES.ADMIN]      : ["/transactions"], // Cannot access dashboard (/), fee-rules, or investments
} as const;

export const DEFAULT_REDIRECTS = {
  [ROLES.SUPERADMIN] : "/",
  [ROLES.ADMIN]      : "/transactions",
} as const;
