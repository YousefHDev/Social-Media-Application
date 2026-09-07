import { sendError } from '../utils/responseHandler.js';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      return sendError(res, 400, 'Validation Error', errorDetails);
    }
    req.body = value;
    next();
  };
};
