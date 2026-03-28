import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppEnv } from "./config/env";
import type { FirebaseAuthService } from "./services/firebase-admin";
import type { MockRepository } from "./repositories/mock-repository";
import type { RealtimeHub } from "./services/realtime-hub";

export interface Viewer {
  userId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface RouteDeps {
  env: AppEnv;
  auth: FirebaseAuthService;
  realtime: RealtimeHub;
  repo: MockRepository;
}

export type ViewerRequest = FastifyRequest & {
  viewer?: Viewer;
};

export type RouteHandlerRequest<T = FastifyRequest> = T & ViewerRequest;

export type AuthPreHandler = (
  request: ViewerRequest,
  reply: FastifyReply
) => Promise<void>;
