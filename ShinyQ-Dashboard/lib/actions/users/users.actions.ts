"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { getUser, searchUsers } from "./users.service";
import type { UsersFilter } from "./users.types";

export type {
  UserRecord,
  UserRole,
  UsersFilter,
  UserStatus,
} from "./users.types";

export async function searchUsersResultAction(filter: UsersFilter) {
  return withActionResult(() => searchUsers(filter));
}

export async function getUserResultAction(id: string) {
  return withActionResult(() => getUser(id));
}
