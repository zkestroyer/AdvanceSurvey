import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided', data: null, errors: ['no_token'] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Attempt to parse permissions if it's a string (FCR #7 structured permissions)
    if (decoded && typeof decoded === 'object' && typeof (decoded as any).permissions === 'string') {
      try {
        (decoded as any).permissions = JSON.parse((decoded as any).permissions);
      } catch (e) {
        // Fallback to original string if parse fails
      }
    }
    
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token', data: null, errors: ['invalid_token'] });
  }
};
