import { sendError } from '../utils/responseHandler.js';
import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'File size too large for this upload.');
    }
    return sendError(res, 400, `File upload error: ${err.message}`);
  }

  // Custom validation or Multer filter error
  if (
    err.message &&
    (err.message.includes('Only image files') ||
      err.message.includes('Invalid file type') ||
      err.message.includes('Invalid story file type'))
  ) {
    return sendError(res, 400, err.message);
  }

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, 409, `A record with that ${field} already exists.`);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return sendError(res, 400, 'Validation Error', errors);
  }

  // JWT authorization errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token expired.');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, statusCode, message);
};
