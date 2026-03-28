import { bookingQuoteSchema } from "@everides/shared";
import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type BookingsPlugin = FastifyPluginAsync<RouteDeps>;

export const bookingRoutes: BookingsPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.post("/quote", { preHandler: requireViewer }, async (request, reply) => {
    const parsed = bookingQuoteSchema.parse(request.body);
    const quote = deps.repo.quoteBooking(
      parsed.vehicleId,
      parsed.startTime,
      parsed.endTime
    );

    if (!quote) {
      return reply.code(404).send({
        message: "Vehicle not found."
      });
    }

    return {
      quote,
      consentVersion: "2026-03-01"
    };
  });

  app.post("/", { preHandler: requireViewer }, async (request, reply) => {
    const booking = deps.repo.createBooking(request.viewer!.userId, request.body);
    if (!booking) {
      return reply.code(400).send({
        message: "Unable to create booking."
      });
    }

    return reply.code(201).send({
      booking
    });
  });

  app.get("/", { preHandler: requireViewer }, async (request) => {
    const query = request.query as { scope?: "rider" | "host" };
    return {
      bookings: deps.repo.listBookings(request.viewer!.userId, query.scope)
    };
  });

  app.get("/:id", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const booking = deps.repo.getBooking(id);
    if (!booking) {
      return reply.code(404).send({
        message: "Booking not found."
      });
    }

    return {
      booking
    };
  });

  app.patch("/:id/approve", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const booking = deps.repo.updateBookingStatus(id, request.viewer!.userId, "APPROVED");
    if (!booking) {
      return reply.code(404).send({
        message: "Booking not found."
      });
    }

    return {
      booking
    };
  });

  app.patch("/:id/deny", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { reason?: string };
    const booking = deps.repo.updateBookingStatus(
      id,
      request.viewer!.userId,
      "CANCELLED",
      body.reason
    );
    if (!booking) {
      return reply.code(404).send({
        message: "Booking not found."
      });
    }
    return {
      booking
    };
  });

  app.patch("/:id/start", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const booking = deps.repo.updateBookingStatus(id, request.viewer!.userId, "ACTIVE");
    if (!booking) {
      return reply.code(404).send({
        message: "Booking not found."
      });
    }

    return {
      booking
    };
  });

  app.patch("/:id/end", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const booking = deps.repo.updateBookingStatus(id, request.viewer!.userId, "COMPLETED");
    if (!booking) {
      return reply.code(404).send({
        message: "Booking not found."
      });
    }

    return {
      booking
    };
  });

  app.patch("/:id/cancel", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { reason?: string };
    const booking = deps.repo.updateBookingStatus(
      id,
      request.viewer!.userId,
      "CANCELLED",
      body.reason
    );
    if (!booking) {
      return reply.code(404).send({
        message: "Booking not found."
      });
    }

    return {
      booking
    };
  });
};
