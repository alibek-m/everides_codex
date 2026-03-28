import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { env } from "./config/env";
import { MockRepository } from "./repositories/mock-repository";
import { adminRoutes } from "./routes/admin";
import { bookingRoutes } from "./routes/bookings";
import { favoriteRoutes } from "./routes/favorites";
import { healthRoutes } from "./routes/health";
import { locationRoutes } from "./routes/location";
import { messageRoutes } from "./routes/messages";
import { paymentRoutes } from "./routes/payments";
import { reviewRoutes } from "./routes/reviews";
import { userRoutes } from "./routes/users";
import { vehicleRoutes } from "./routes/vehicles";
import { FirebaseAuthService } from "./services/firebase-admin";
import { RealtimeHub } from "./services/realtime-hub";

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "info" : "warn"
    }
  });

  const repo = new MockRepository();
  const auth = new FirebaseAuthService();
  const realtime = new RealtimeHub();

  const deps = {
    env,
    auth,
    realtime,
    repo
  };

  app.register(cors, {
    origin: env.allowedOrigins,
    credentials: true
  });
  app.register(sensible);
  app.register(websocket);

  app.register(healthRoutes);
  app.register(userRoutes, {
    prefix: "/api/users",
    ...deps
  });
  app.register(vehicleRoutes, {
    prefix: "/api/vehicles",
    ...deps
  });
  app.register(bookingRoutes, {
    prefix: "/api/bookings",
    ...deps
  });
  app.register(locationRoutes, {
    prefix: "/api/location",
    ...deps
  });
  app.register(messageRoutes, {
    prefix: "/api/messages",
    ...deps
  });
  app.register(reviewRoutes, {
    prefix: "/api/reviews",
    ...deps
  });
  app.register(favoriteRoutes, {
    prefix: "/api/favorites",
    ...deps
  });
  app.register(paymentRoutes, {
    prefix: "/api/payments",
    ...deps
  });
  app.register(adminRoutes, {
    prefix: "/api/admin",
    ...deps
  });

  return app;
};
