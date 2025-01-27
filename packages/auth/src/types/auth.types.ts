export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export interface JWTPayload {
  sub: string;
  email: string;
  type: TokenType;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  roles: string[];
  permissions: string[];
  [key: string]: any;
}

export interface AuthenticationResult {
  user: AuthenticatedUser;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}
