export type Scope =
  | "chat:read"
  | "chat:write"
  | "admin:*";

export interface AuthUser {
  id: string;
  scopes: Scope[];
}
