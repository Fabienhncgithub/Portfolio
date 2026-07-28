import type { Core } from "@strapi/strapi";

const lifecycle = {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (publicRole) {
      const permissions = strapi.db
        .query("plugin::users-permissions.permission");

      await permissions.deleteMany({ where: { role: publicRole.id } });

      if (process.env.NODE_ENV === "development") {
        for (const action of [
          "api::photo.photo.find",
          "api::photo.photo.findOne",
        ]) {
          await permissions.create({
            data: {
              action,
              role: publicRole.id,
            },
          });
        }
      }
    }

    const pluginStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "advanced",
    });
    const settings = await pluginStore.get() as Record<string, unknown> | undefined;

    await pluginStore.set({
      value: {
        ...settings,
        allow_register: false,
      },
    });
  },
};

export default lifecycle;
