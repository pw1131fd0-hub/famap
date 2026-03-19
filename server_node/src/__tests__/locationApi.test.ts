import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { mockLocations } from '../data/seed-data.js';

describe('Location API', () => {
  const originalLocations = [...mockLocations];

  beforeEach(() => {
    mockLocations.length = 0;
    mockLocations.push(...originalLocations);
  });

  describe('GET /api/locations', () => {
    it('should return nearby locations with valid params', async () => {
      const res = await request(app)
        .get('/api/locations')
        .query({ lat: 25.03, lng: 121.53, radius: 2000 });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid params', async () => {
      const res = await request(app)
        .get('/api/locations')
        .query({ lat: 'invalid', lng: 121.53 });
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/locations/:id', () => {
    it('should return a location by id', async () => {
      const res = await request(app).get('/api/locations/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('1');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).get('/api/locations/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/locations', () => {
    it('should create a new location', async () => {
      const newLoc = {
        name: { zh: '測試地點', en: 'Test Place' },
        description: { zh: '測試描述', en: 'Test Desc' },
        category: 'park',
        coordinates: { lat: 25.1, lng: 121.6 },
        address: { zh: '測試地址', en: 'Test Addr' },
        facilities: ['nursing_room'],
      };

      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', 'Bearer mock-token-u1')
        .send(newLoc);
      
      expect(res.status).toBe(201);
      expect(res.body.name.zh).toBe('測試地點');
    });

    it('should return 400 for invalid location data', async () => {
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({ name: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .post('/api/locations')
        .send({});
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/locations/:id', () => {
    it('should update an existing location', async () => {
      const updateData = {
        name: { zh: '更新後的名稱', en: 'Updated Name' }
      };

      const res = await request(app)
        .patch('/api/locations/1')
        .set('Authorization', 'Bearer mock-token-u1')
        .send(updateData);
      
      expect(res.status).toBe(200);
      expect(res.body.name.zh).toBe('更新後的名稱');
    });

    it('should return 400 for invalid update data', async () => {
      const res = await request(app)
        .patch('/api/locations/1')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({ category: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .patch('/api/locations/999')
        .set('Authorization', 'Bearer mock-token-u1')
        .send({ name: { zh: 'New', en: 'New' } });
      expect(res.status).toBe(404);
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .patch('/api/locations/1')
        .send({});
      expect(res.status).toBe(401);
    });
  });
});
