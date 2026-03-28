import {
  locationAlertSchema,
  locationLogBatchSchema
} from "@everides/shared";
import type { FastifyPluginAsync } from "fastify";
import { nanoid } from "nanoid";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type LocationPlugin = FastifyPluginAsync<RouteDeps>;

export const locationRoutes: LocationPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.post("/log", { preHandler: requireViewer }, async (request) => {
    const parsed = locationLogBatchSchema.parse(request.body);
    const points = parsed.points.map((point) => ({
      ...point,
      id: nanoid()
    }));
    deps.repo.appendLocationPoints(points);

    for (const point of points) {
      deps.realtime.publish(
        `location:${point.bookingId}`,
        "location:update",
        point
      );
    }

    return {
      received: points.length
    };
  });

  app.get("/booking/:bookingId", { preHandler: requireViewer }, async (request) => {
    const { bookingId } = request.params as { bookingId: string };
    return {
      points: deps.repo.listLocationPoints(bookingId)
    };
  });

  app.post("/alert", { preHandler: requireViewer }, async (request) => {
    const alert = locationAlertSchema.parse(request.body);
    const created = deps.repo.createLocationAlert(alert);
    deps.realtime.publish(`location:${alert.bookingId}`, "location:alert", created);
    return {
      alert: created
    };
  });

  app.get(
    "/live/:bookingId",
    { websocket: true, preHandler: requireViewer },
    async (socket, request) => {
      const { bookingId } = request.params as { bookingId: string };
      deps.realtime.subscribe(`location:${bookingId}`, socket);
      socket.send(
        JSON.stringify({
          event: "location:ready",
          payload: {
            bookingId
          }
        })
      );
    }
  );
};
