// token information consolidated from provider
interface TokenResponse {
  access_token: string;
  access_token_expiry: number;
  refresh_token: string;
  refresh_token_expiry: number;
}

export { TokenResponse };
