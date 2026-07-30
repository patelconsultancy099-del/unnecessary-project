import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  logger.error(error.message, { stack: error.stack });
  res.status(error.status || 500).json({
    message: error.status ? error.message : 'Internal server error'
  });
}
