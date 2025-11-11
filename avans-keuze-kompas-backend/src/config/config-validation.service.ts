import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class ConfigValidationService {
  static validationSchema = Joi.object({
    // Server Configuration
    PORT: Joi.number().default(4000),
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),

    // Database Configuration
    DATABASE_URL: Joi.string().required().messages({
      'string.empty': 'DATABASE_URL is required',
      'any.required': 'DATABASE_URL must be set in environment variables',
    }),

    // JWT Configuration
    JWT_SECRET: Joi.string().min(32).required().messages({
      'string.empty': 'JWT_SECRET is required',
      'string.min': 'JWT_SECRET must be at least 32 characters long',
      'any.required': 'JWT_SECRET must be set in environment variables',
    }),
    JWT_EXPIRATION: Joi.string().default('1d'),

    // CORS Configuration
    CORS_ORIGIN: Joi.string().required().messages({
      'string.empty': 'CORS_ORIGIN is required',
      'any.required': 'CORS_ORIGIN must be set in environment variables',
    }),

    // N8n Configuration
    N8N_WEBHOOK_URL: Joi.string().uri().required().messages({
      'string.empty': 'N8N_WEBHOOK_URL is required',
      'string.uri': 'N8N_WEBHOOK_URL must be a valid URL',
      'any.required': 'N8N_WEBHOOK_URL must be set in environment variables',
    }),
  });
}
