import jwt from 'jsonwebtoken';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || '15m'
  });
}

export function signRefreshToken(user, tokenVersion) {
  return jwt.sign({ sub: user.id, tokenVersion }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL || '30d'
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
