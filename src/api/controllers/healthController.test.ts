import request from 'supertest';
import express from 'express';
import healthRoutes from '../routes/healthRoutes'; // Adjust the path as necessary

// Create a new express app for testing
const app = express();
// It's important to use the same prefix as in your main app
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;
app.use(`${API_PREFIX}/health`, healthRoutes);

// Extend test timeout if necessary
describe('Health Check API', () => {
  it('should return 200 and healthy status for /healthz', async () => {
    const response = await request(app).get(`${API_PREFIX}/health/healthz`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'healthy' });
  });
});
