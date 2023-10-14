/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      req.body.userid = decoded._id;
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }
}
