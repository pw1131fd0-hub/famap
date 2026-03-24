import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { LocationService } from '../services/locationService.js';
import { AuthService } from '../services/authService.js';

vi.mock('../services/locationService.js', () => ({
  LocationService: {
    findNearby: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }
}));

vi.mock('../services/authService.js', () => ({
  AuthService: {
    getMe: vi.fn().mockResolvedValue({ id: 'u1', displayName: 'Test User' }),
  }
}));

describe('Location API Errors', () => {
  it('should return 500 if LocationService.findNearby throws', async () => {
    vi.mocked(LocationService.findNearby).mockImplementation(() => {
      throw new Error('DB Error');
    });
    const res = await request(app)
      .get('/api/locations')
      .query({ lat: 25.03, lng: 121.53, radius: 2000 });
    expect(res.status).toBe(500);
  });

  it('should return 500 if LocationService.findById throws', async () => {
    vi.mocked(LocationService.findById).mockImplementation(() => {
      throw new Error('DB Error');
    });
    const res = await request(app).get('/api/locations/1');
    expect(res.status).toBe(500);
  });

  it('should return 500 if LocationService.create throws', async () => {
    vi.mocked(LocationService.create).mockImplementation(() => {
      throw new Error('DB Error');
    });
    const res = await request(app)
      .post('/api/locations')
      .set('Authorization', 'Bearer mock-token')
      .send({
        name: { zh: '測試', en: 'Test' },
        description: { zh: '描述', en: 'Description' },
        category: 'park',
        coordinates: { lat: 25.04, lng: 121.54 },
        address: { zh: '地址', en: 'Address' },
        facilities: []
      });
    expect(res.status).toBe(500);
  });
});
