import { type Request, type Response } from 'express';
import { z } from 'zod';
import { LocationService } from '../services/locationService.js';

const searchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().default(5000), // Default 5km
  category: z.enum(['park', 'nursing_room', 'restaurant', 'medical']).optional(),
  stroller_accessible: z.coerce.boolean().optional(),
});

const locationCreateSchema = z.object({
  name: z.object({ zh: z.string(), en: z.string() }),
  description: z.object({ zh: z.string(), en: z.string() }),
  category: z.enum(['park', 'nursing_room', 'restaurant', 'medical']),
  coordinates: z.object({ lat: z.number(), lng: z.number() }),
  address: z.object({ zh: z.string(), en: z.string() }),
  facilities: z.array(z.string()),
});

export class LocationController {
  static async getNearby(req: Request, res: Response) {
    // ... (existing code)
  }

  static async getById(req: Request, res: Response) {
    // ... (existing code)
  }

  static async create(req: Request, res: Response) {
    const parseResult = locationCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid location data', details: parseResult.error.format() });
    }

    const newLocation = await LocationService.create(parseResult.data);
    res.status(201).json(newLocation);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const parseResult = locationCreateSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid location data', details: parseResult.error.format() });
    }

    const updatedLocation = await LocationService.update(id, parseResult.data);
    if (!updatedLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(updatedLocation);
  }
}
