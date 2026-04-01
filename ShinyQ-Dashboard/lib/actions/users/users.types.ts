export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "inactive";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  joined: string;
};

export type UsersFilter = {
  query?: string;
  role?: UserRole;
  page?: number;
  pageSize?: number;
};
