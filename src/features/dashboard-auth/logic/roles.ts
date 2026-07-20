// NOTE: role list only — no permission matrix, session handling, or MFA yet. Those need a
// chosen auth provider and an actual dashboard (Step 37) to define real permissions against;
// building either now would be guessing at requirements neither exists to confirm.
export type DashboardRole = "concierge" | "ae" | "rm" | "dm" | "admin";

export const DASHBOARD_ROLES: DashboardRole[] = ["concierge", "ae", "rm", "dm", "admin"];
