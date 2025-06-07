// user data persisted for a session, similar to user provider data but contains additional id and role fields
interface UserData {
  id: string;
  role: string;
  acceptedAuthorAgreement: boolean;
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

export { UserData };
