import Joi from 'joi';

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'string.empty': 'Confirm password is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'Refresh token is required'
  })
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    'string.min': 'Name must be at least 2 characters long'
  }),
  bio: Joi.string().trim().max(300).allow('').messages({
    'string.max': 'Bio cannot exceed 300 characters'
  })
});

export const createPostSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Post content cannot be empty',
    'string.max': 'Post content cannot exceed 2000 characters'
  }),
  tags: Joi.array().items(Joi.string().trim().pattern(/^[#a-zA-Z0-9_]{1,51}$/)).max(10).optional()
});

export const updatePostSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Post content cannot be empty',
    'string.max': 'Post content cannot exceed 2000 characters'
  }),
  tags: Joi.array().items(Joi.string().trim().pattern(/^[#a-zA-Z0-9_]{1,51}$/)).max(10).optional()
});

export const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Comment content cannot be empty',
    'string.max': 'Comment content cannot exceed 500 characters'
  }),
  parentCommentId: Joi.string().hex().length(24).optional().allow(null, '')
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Comment content cannot be empty',
    'string.max': 'Comment content cannot exceed 500 characters'
  })
});
