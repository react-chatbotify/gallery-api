// token information consolidated from provider
interface TokenResponse {
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
  refreshTokenExpiry: number;
}

export { TokenResponse };
