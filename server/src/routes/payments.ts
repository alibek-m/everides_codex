import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type PaymentsPlugin = FastifyPluginAsync<RouteDeps>;

export const paymentRoutes: PaymentsPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.post("/setup-intent", { preHandler: requireViewer }, async (request) => {
    const method = deps.repo.createMockPaymentMethod(request.viewer!.userId);
    return {
      mode: "mock",
      clientSecret: `mock_secret_${method.id}`,
      paymentMethod: method
    };
  });

  app.get("/methods", { preHandler: requireViewer }, async (request) => ({
    methods: deps.repo.getPaymentMethods(request.viewer!.userId),
    mode: "mock"
  }));

  app.delete("/methods/:id", { preHandler: requireViewer }, async (request) => {
    const { id } = request.params as { id: string };
    return {
      methods: deps.repo.removePaymentMethod(request.viewer!.userId, id),
      mode: "mock"
    };
  });

  app.get("/earnings", { preHandler: requireViewer }, async (request) => ({
    earnings: deps.repo.getEarnings(request.viewer!.userId)
  }));

  app.post("/payout", { preHandler: requireViewer }, async () => ({
    mode: "mock",
    status: "queued",
    message: "Mock payout request created. Stripe Connect is intentionally not wired yet."
  }));
};
