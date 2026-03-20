import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { mockUsers } from '../data/seed-data.js';

describe('Auth API', () => {
  beforeEach(() => {
    // Reset mock users to initial state
    mockUsers.length = 0;
    mockUsers.push({
      id: 'u1',
      email: 'mom@example.com',
      passwordHash: 'hashed_password_1',
      displayName: '小明媽',
      createdAt: '2026-01-01T00:00:00Z',
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          displayName: 'New User'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('new@example.com');
      expect(res.body.token).toBeDefined();
    });

    it('should return 400 if missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if user already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'mom@example.com',
          password: 'password123',
          displayName: 'Mom'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'mom@example.com',
          password: 'password_1'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('mom@example.com');
      expect(res.body.token).toBe('mock-token-u1');
    });

    it('should return 400 if missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'mom@example.com' });
      expect(res.status).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'mom@example.com',
          password: 'wrong_password'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user for valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mock-token-u1');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('mom@example.com');
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('should return 401 if no authorization header', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
