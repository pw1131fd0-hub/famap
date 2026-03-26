import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Health Check', () => {
  it('should return 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBe('FamMap API is running');
    expect(res.body.timestamp).toBeDefined();
    expect(typeof res.body.timestamp).toBe('string');
  });
});
