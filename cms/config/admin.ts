import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const isProduction = env('NODE_ENV') === 'production';
  const secret = (name: string) => {
    const value = env(name);
    if (isProduction && (!value || value.length < 32)) {
      throw new Error(`${name} must contain at least 32 characters in production.`);
    }
    return value!;
  };

  return {
    auth: {
      secret: secret('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: secret('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: secret('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: secret('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
  };
};

export default config;
