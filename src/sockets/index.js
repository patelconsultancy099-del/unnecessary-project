import Device from '../models/Device.js';
import Command from '../models/Command.js';
import { logger } from '../utils/logger.js';

export function registerSocketHandlers(io) {
  io.on('connection', async (socket) => {
    const userId = socket.user.sub;
    socket.join(`user:${userId}`);

    socket.on('device:join', async ({ deviceId }) => {
      const device = await Device.findOneAndUpdate({ deviceId, owner: userId }, { connectionId: socket.id, status: 'online', lastSeenAt: new Date() }, { new: true });
      if (device) {
        socket.join(`device:${deviceId}`);
        io.to(`user:${userId}`).emit('device:update', { device });
      }
    });

    socket.on('telemetry:location', (payload) => io.to(`user:${userId}`).emit('location:update', payload));
    socket.on('telemetry:battery', (payload) => io.to(`user:${userId}`).emit('battery:update', payload));
    socket.on('telemetry:movement', (payload) => io.to(`user:${userId}`).emit('movement:update', payload));
    socket.on('command:ack', async (payload) => {
      const command = await Command.findOne({ _id: payload.commandId, owner: userId });
      if (!command) return;
      command.status = payload.status || 'acknowledged';
      if (command.status === 'acknowledged') command.acknowledgedAt = new Date();
      if (['completed', 'failed'].includes(command.status)) command.completedAt = new Date();
      await command.save();
      io.to(`user:${userId}`).emit('command:update', { command });
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { socketId: socket.id, userId });
    });
  });
}




