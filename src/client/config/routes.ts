export const PUBLIC_ROUTES = {
  home: "/",
  landing: "/",
} as const;

export const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export const DASHBOARD_ROUTES = {
  home: "/dashboard",
  cv: "/dashboard/cv",
  jobs: "/dashboard/jobs",
  matches: "/dashboard/matches",
} as const;

export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...DASHBOARD_ROUTES,
};
