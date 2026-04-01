import type { NavGroup, NavItem } from "@/types/nav";
import type { SessionUser } from "@/types/session";

/**
 * Apply RBAC / feature flags to navigation (baseline §3.3).
 * `NavAccessRule.scope` maps to `SessionUser.roles[].groupId`.
 */
export function resolveMenuForSession(
  items: NavItem[],
  user: SessionUser | null,
): NavItem[] {
  return items.filter((item) => {
    if (item.enabled === false) return false;
    const rules = item.requiredAccess;
    if (!rules?.length) return true;
    if (!user?.roles?.length) return false;
    return rules.every((rule) =>
      user.roles!.some((r) => r.role === rule.role && r.groupId === rule.scope),
    );
  });
}

/**
 * Apply RBAC / feature flags to grouped navigation.
 * Filters items within each group and removes empty groups.
 */
export function resolveMenuGroupsForSession(
  groups: NavGroup[],
  user: SessionUser | null,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: resolveMenuForSession(group.items, user),
    }))
    .filter((group) => group.items.length > 0);
}
