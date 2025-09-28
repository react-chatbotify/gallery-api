import { http, BASE } from '../../../test/utils/testServer';

describe('userRoutes', () => {
  it('mounts and returns 404/401/403 for an unknown subroute (no 5xx)', async () => {
    const res = await http().get(`${BASE}/__unknown__`);
    expect(res.status).toBeGreaterThanOrEqual(401); // could be 401/403/404
    expect(res.status).toBeLessThan(500);           // must not 5xx
  });
});
