// common user data retrieved from providers
interface UserProviderData {
  name: string;
  email: string;
  handle: string;
  avatarUrl: string;
  status: string;
  location: string;
  profileUrl: string;
  provider: string;
  providerUserId: string;
}

export { UserProviderData };
