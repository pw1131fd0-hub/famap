import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.ts';

describe('Health Check', () => {
  it('should return 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', message: 'FamMap API is running' });
  });
});
