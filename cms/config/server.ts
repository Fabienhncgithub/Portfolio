import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => {
  const publicUrl = env('PUBLIC_URL');
  const appKeys = env.array('APP_KEYS') ?? [];
  const isProduction = env('NODE_ENV') === 'production';

  if (
    isProduction
    && (
      appKeys.length < 2
      || appKeys.some((key) => key.length < 32)
      || new Set(appKeys).size !== appKeys.length
    )
  ) {
    throw new Error('APP_KEYS must contain at least two independent 32-character secrets.');
  }

  if (isProduction) {
    const parsedPublicUrl = publicUrl ? new URL(publicUrl) : undefined;
    if (
      !parsedPublicUrl
      || parsedPublicUrl.protocol !== 'https:'
      || parsedPublicUrl.username
      || parsedPublicUrl.password
    ) {
      throw new Error('PUBLIC_URL must be an absolute HTTPS URL without credentials.');
    }
  }

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    ...(publicUrl ? { url: publicUrl } : {}),
    app: {
      keys: appKeys,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};

export default config;
