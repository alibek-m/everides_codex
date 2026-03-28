import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type FavoritesPlugin = FastifyPluginAsync<RouteDeps>;

export const favoriteRoutes: FavoritesPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.get("/", { preHandler: requireViewer }, async (request) => ({
    favorites: deps.repo.listFavorites(request.viewer!.userId)
  }));

  app.post("/:vehicleId", { preHandler: requireViewer }, async (request) => {
    const { vehicleId } = request.params as { vehicleId: string };
    return {
      favorites: deps.repo.toggleFavorite(request.viewer!.userId, vehicleId)
    };
  });

  app.delete("/:vehicleId", { preHandler: requireViewer }, async (request) => {
    const { vehicleId } = request.params as { vehicleId: string };
    return {
      favorites: deps.repo.toggleFavorite(request.viewer!.userId, vehicleId)
    };
  });
};
