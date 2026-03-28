import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type AdminPlugin = FastifyPluginAsync<RouteDeps>;

export const adminRoutes: AdminPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.addHook("preHandler", requireViewer);
  app.addHook("preHandler", async (request, reply) => {
    if (!request.viewer?.isAdmin) {
      return reply.code(403).send({
        message: "Admin access required."
      });
    }
  });

  app.get("/vehicles/pending", async () => ({
    vehicles: deps.repo.listPendingVehicles()
  }));

  app.patch("/vehicles/:id/verify", async (request, reply) => {
    const { id } = request.params as { id: string };
    const vehicle = deps.repo.approveVehicle(id);
    if (!vehicle) {
      return reply.code(404).send({
        message: "Vehicle not found."
      });
    }

    return {
      vehicle
    };
  });

  app.get("/bookings/active", async () => ({
    bookings: deps.repo.listActiveBookings()
  }));

  app.get("/alerts", async () => ({
    alerts: deps.repo.listLocationAlerts()
  }));
};
