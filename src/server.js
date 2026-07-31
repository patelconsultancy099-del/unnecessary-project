import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { verifyAccessToken } from './utils/tokens.js';
import { registerSocketHandlers } from './sockets/index.js';

dotenv.config();

const port = process.env.PORT || 5000;
await connectDatabase();

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  allowEIO3: true,
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true
  }
});

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  const cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return cookies;
}

io.use(async (socket, next) => {
  try {
    const auth = socket.handshake.auth || {};
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = auth.token || cookies.accessToken;
    
    if (token) {
      socket.user = verifyAccessToken(token);
      return next();
    }
    
    if (auth.deviceId && auth.deviceSecret) {
      const Device = (await import('./models/Device.js')).default;
      const device = await Device.findOne({ deviceId: auth.deviceId, deviceSecret: auth.deviceSecret });
      if (!device) throw new Error('Invalid device credentials');
      socket.user = { sub: device.owner.toString(), isDevice: true, deviceId: device.deviceId };
      return next();
    }
    
    throw new Error('Missing authentication token or device credentials');
  } catch (error) {
    next(error);
  }
});

registerSocketHandlers(io);
app.set('io', io);

server.listen(port, () => logger.info(`SecureGuard API listening on ${port}`));

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection', { message: error.message, stack: error.stack });
});
