import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer, createResolveViewer } from "../utils/auth";

type VehiclesPlugin = FastifyPluginAsync<RouteDeps>;

export const vehicleRoutes: VehiclesPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);
  const resolveViewer = createResolveViewer(deps);

  app.get("/", { preHandler: resolveViewer }, async (request) => {
    const filters = request.query as Record<string, string | undefined>;
    let items = deps.repo.listVehicles(
        {
          query: filters.query,
          maxPricePerDay: filters.maxPricePerDay
            ? Number(filters.maxPricePerDay)
            : undefined,
          type: filters.type as never,
          sortBy: filters.sortBy as never,
          favoritesOnly: filters.favoritesOnly === "true"
        },
        request.viewer?.userId
      );

    if (filters.hostId) {
      items = items.filter((vehicle) => vehicle.hostId === filters.hostId);
    }

    if (filters.status) {
      items = items.filter((vehicle) => vehicle.status === filters.status);
    }

    return {
      items
    };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const vehicle = deps.repo.getVehicle(id);
    if (!vehicle) {
      return reply.code(404).send({
        message: "Vehicle not found."
      });
    }

    return {
      vehicle,
      reviews: deps.repo.listReviewsForVehicle(id)
    };
  });

  app.post("/", { preHandler: requireViewer }, async (request, reply) => {
    const vehicle = deps.repo.createVehicle(request.viewer!.userId, request.body);
    if (!vehicle) {
      return reply.code(400).send({
        message: "Unable to create vehicle."
      });
    }

    return reply.code(201).send({
      vehicle
    });
  });

  app.patch("/:id", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const vehicle = deps.repo.updateVehicle(
      request.viewer!.userId,
      id,
      request.body as Record<string, unknown>
    );
    if (!vehicle) {
      return reply.code(404).send({
        message: "Vehicle not found."
      });
    }

    return {
      vehicle
    };
  });

  app.delete("/:id", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const vehicle = deps.repo.delistVehicle(request.viewer!.userId, id);
    if (!vehicle) {
      return reply.code(404).send({
        message: "Vehicle not found."
      });
    }

    return {
      vehicle
    };
  });

  app.get("/:id/availability", async (request) => {
    const { id } = request.params as { id: string };
    return {
      availability: deps.repo.listVehicleAvailability(id)
    };
  });

  app.patch("/:id/availability", { preHandler: requireViewer }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { startDate: string; endDate: string };
    return {
      availability: deps.repo.blockVehicleAvailability(id, body.startDate, body.endDate)
    };
  });
};
