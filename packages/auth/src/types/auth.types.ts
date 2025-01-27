export interface AuthenticatedUser {
  id: string;
  roles: string[];
  permissions: string[];
  [key: string]: unknown;
}

export interface AuthenticationResult {
  user: AuthenticatedUser;
  token?: string;
  refreshToken?: string;
}
