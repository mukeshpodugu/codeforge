import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Repo } from '../utils/repo';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'codeforge_super_secure_jwt_secret_key_123!';
    const decoded = jwt.verify(token, secret) as { id: string; role: 'user' | 'admin' };

    const user = await Repo.findUserById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'User session not found.' });
    }

    req.user = {
      id: user._id || user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
  }
  next();
};
