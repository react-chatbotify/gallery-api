import { checkIsAdminUser } from '../../../src/api/services/authorization';
import { UserData } from '../../../src/api/interfaces/UserData';

describe('checkIsAdminUser', () => {
  const baseUser: UserData = {
    id: 'user-1',
    role: 'viewer',
    acceptedAuthorAgreement: true,
    name: 'Test User',
    email: 'test@example.com',
    handle: 'test-user',
    avatarUrl: 'https://example.com/avatar.png',
    status: 'active',
    location: 'Earth',
    profileUrl: 'https://example.com/profile',
    provider: 'github',
    providerUserId: '123',
  };

  it('returns true for users with the ADMIN role regardless of case', () => {
    expect(checkIsAdminUser({ ...baseUser, role: 'admin' })).toBe(true);
    expect(checkIsAdminUser({ ...baseUser, role: 'ADMIN' })).toBe(true);
  });

  it('returns false for non-admin roles', () => {
    expect(checkIsAdminUser(baseUser)).toBe(false);
  });
});