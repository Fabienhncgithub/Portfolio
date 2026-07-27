import type { Core } from "@strapi/strapi";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register() {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const roleQuery = strapi.db.query("plugin::users-permissions.role");
    const permissionQuery = strapi.db.query("plugin::users-permissions.permission");
    const publicRole = await roleQuery.findOne({ where: { type: "public" } });

    if (!publicRole) return;

    const publicReadActions = [
      "api::photo.photo.find",
      "api::photo.photo.findOne",
      "plugin::upload.content-api.find",
      "plugin::upload.content-api.findOne",
    ];

    for (const action of publicReadActions) {
      const permission = await permissionQuery.findOne({
        where: { action, role: publicRole.id },
      });

      if (!permission) {
        await permissionQuery.create({
          data: { action, role: publicRole.id },
        });
      }
    }
  },
};
