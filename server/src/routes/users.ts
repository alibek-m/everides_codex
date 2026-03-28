import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type UsersPlugin = FastifyPluginAsync<RouteDeps>;

export const userRoutes: UsersPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.get("/me", { preHandler: requireViewer }, async (request, reply) => {
    const profile = deps.repo.getCurrentUser(request.viewer!.userId);

    if (!profile) {
      return reply.code(404).send({
        message: "Profile not found."
      });
    }

    return {
      profile,
      identity: deps.repo.getIdentityStatus(request.viewer!.userId)
    };
  });

  app.patch("/me", { preHandler: requireViewer }, async (request, reply) => {
    const profile = deps.repo.updateCurrentUser(
      request.viewer!.userId,
      request.body
    );

    if (!profile) {
      return reply.code(404).send({
        message: "Profile not found."
      });
    }

    return {
      profile
    };
  });

  app.post("/me/avatar", { preHandler: requireViewer }, async (request, reply) => {
    const body = request.body as { avatarUrl?: string };

    if (!body.avatarUrl) {
      return reply.code(400).send({
        message: "avatarUrl is required."
      });
    }

    const profile = deps.repo.updateAvatar(request.viewer!.userId, body.avatarUrl);
    return {
      profile
    };
  });

  app.post(
    "/me/verify-identity",
    { preHandler: requireViewer },
    async (request) => ({
      verification: deps.repo.updateIdentity(request.viewer!.userId, request.body)
    })
  );

  app.get("/me/notifications", { preHandler: requireViewer }, async (request) => ({
    notifications: deps.repo.listNotifications(request.viewer!.userId)
  }));

  app.patch(
    "/me/notifications/:id/read",
    { preHandler: requireViewer },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const notification = deps.repo.markNotificationRead(
        request.viewer!.userId,
        id
      );

      if (!notification) {
        return reply.code(404).send({
          message: "Notification not found."
        });
      }

      return {
        notification
      };
    }
  );

  app.get("/:id/public-profile", async (request, reply) => {
    const { id } = request.params as { id: string };
    const profile = deps.repo.getPublicProfile(id);

    if (!profile) {
      return reply.code(404).send({
        message: "User not found."
      });
    }

    return {
      profile
    };
  });
};
