import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

const maxUploadSize = 25 * 1024 * 1024;

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const jwtSecret = env('JWT_SECRET');
  if (env('NODE_ENV') === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.');
  }

  return {
    'users-permissions': {
      config: {
        jwtManagement: 'refresh',
        jwtSecret,
        sessions: {
          httpOnly: true,
        },
      },
    },
    upload: {
      config: {
        sizeLimit: maxUploadSize,
        security: {
          allowedTypes: allowedMediaTypes,
        },
      },
    },
  };
};

export default config;
