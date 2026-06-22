export type AccessTokenPayload = {
  type: "access"; // Type of the token
  sub: string; // Subject (User ID)
  jti: string; // JWT ID (unique identifier for the token)
  email: string; // Email of the user
  role: string; // Role of the user
  iat: number; // Issued At (timestamp of when the token was issued)
  exp: number; // Expiration Time (timestamp of when the token will expire)
}

export type RefreshTokenPayload = {
  type: "refresh"; // Type of the token
  sub: string; // Subject (User ID)
  jti: string; // JWT ID (unique identifier for the token)
  iat: number; // Issued At (timestamp of when the token was issued)
  exp: number; // Expiration Time (timestamp of when the token will expire)
}