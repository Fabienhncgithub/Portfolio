import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const allowedOrigins = env.array('CORS_ORIGINS', ['http://localhost:3000']);
  if (env('NODE_ENV') === 'production') {
    const invalidOrigin = allowedOrigins.find((origin) => {
      if (origin === '*') return true;

      try {
        const parsed = new URL(origin);
        return parsed.protocol !== 'https:' || parsed.origin !== origin;
      } catch {
        return true;
      }
    });

    if (invalidOrigin) {
      throw new Error(`Invalid production CORS origin: ${invalidOrigin}`);
    }
  }

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        credentials: false,
        origin: allowedOrigins,
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        methods: ['GET', 'HEAD', 'OPTIONS'],
        keepHeadersOnError: true,
      },
    },
    'strapi::query',
    {
      name: 'strapi::body',
      config: {
        formLimit: '25mb',
        jsonLimit: '1mb',
        textLimit: '1mb',
        formidable: {
          maxFileSize: 25 * 1024 * 1024,
        },
      },
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
