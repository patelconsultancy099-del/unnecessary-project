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
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error('Missing socket token');
    socket.user = verifyAccessToken(token);
    next();
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
