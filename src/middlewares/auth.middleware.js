import User from '../models/User.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid session' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Insufficient privileges' });
    next();
  };
}
