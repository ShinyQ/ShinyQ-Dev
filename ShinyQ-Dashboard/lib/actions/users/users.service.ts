import type { UserRecord, UsersFilter } from "./users.types";

/**
 * Users service — wire to your user management API or identity provider.
 *
 * Currently returns mock data. Replace with real API calls
 * via internalJson() from @/lib/api-client.
 */

export async function searchUsers(
  _filter: UsersFilter,
): Promise<{ users: UserRecord[]; total: number }> {
  // TODO: replace with internalJson("/api/v1/users", ...)
  return { users: [], total: 0 };
}

export async function getUser(_id: string): Promise<UserRecord | null> {
  // TODO: replace with internalJson(`/api/v1/users/${id}`, ...)
  return null;
}
