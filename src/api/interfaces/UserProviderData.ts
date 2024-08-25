// common user data retrieved from providers
interface UserProviderData {
  name: string;
  email: string;
  handle: string;
  avatar_url: string;
  status: string;
  location: string;
  profile_url: string;
  provider: string;
  provider_user_id: string;
}

export { UserProviderData };
