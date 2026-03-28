import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type ReviewsPlugin = FastifyPluginAsync<RouteDeps>;

export const reviewRoutes: ReviewsPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.post("/", { preHandler: requireViewer }, async (request) => ({
    review: deps.repo.createReview(request.viewer!.userId, request.body)
  }));

  app.get("/vehicle/:vehicleId", async (request) => {
    const { vehicleId } = request.params as { vehicleId: string };
    return {
      reviews: deps.repo.listReviewsForVehicle(vehicleId)
    };
  });

  app.get("/user/:userId", async (request) => {
    const { userId } = request.params as { userId: string };
    return {
      reviews: deps.repo.listReviewsForUser(userId)
    };
  });
};
