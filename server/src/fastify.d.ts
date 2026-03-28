import "fastify";
import type { Viewer } from "./types";

declare module "fastify" {
  interface FastifyRequest {
    viewer?: Viewer;
  }
}
