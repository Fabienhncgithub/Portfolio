import { mergeConfig, type UserConfig } from 'vite';

const extendViteConfig = (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};

export default extendViteConfig;
