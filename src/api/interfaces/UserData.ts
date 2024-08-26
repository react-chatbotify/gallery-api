// user data persisted for a session, similar to user provider data but contains additional id and role fields
interface UserData {
  id: string;
  role: string;
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

export { UserData };
