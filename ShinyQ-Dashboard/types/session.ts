/** Aligns with baseline §6.2 — map your auth provider into this shape. */
export type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  roles?: Array<{ groupId: string; role: string }>;
  scopes?: string[];
};
