import User from '../models/User.js';
import Device from '../models/Device.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');
    
    if (scheme === 'Device' && token) {
      const deviceId = req.get('x-device-id');
      if (!deviceId) return res.status(401).json({ message: 'Device authorization requires X-Device-Id header' });
      const device = await Device.findOne({ deviceId, deviceSecret: token }).populate('owner');
      if (!device || !device.owner || !device.owner.isActive) {
        return res.status(401).json({ message: 'Invalid device credentials' });
      }
      req.user = device.owner;
      req.device = device;
      return next();
    }
    
    const jwtToken = (scheme === 'Bearer' && token) ? token : req.cookies?.accessToken;
    if (!jwtToken) return res.status(401).json({ message: 'Authentication required' });
    
    const payload = verifyAccessToken(jwtToken);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid session' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Insufficient privileges' });
    next();
  };
}
