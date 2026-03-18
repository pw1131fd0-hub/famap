import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const response = await AuthService.register({ email, password, displayName });
      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const response = await AuthService.login({ email, password });
      res.json(response);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization header' });
      }
      const token = authHeader.split(' ')[1] || '';
      const user = await AuthService.getMe(token);
      res.json(user);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
