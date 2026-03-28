import type { FastifyReply } from "fastify";
import type { AuthPreHandler, RouteDeps, Viewer, ViewerRequest } from "../types";

const parseBearerToken = (authorization?: string) => {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const deriveNameParts = (name?: string) => {
  if (!name) {
    return {
      firstName: "Eve",
      lastName: "Rider"
    };
  }

  const [firstName = "Eve", ...rest] = name.split(" ");
  return {
    firstName,
    lastName: rest.join(" ") || "Rider"
  };
};

export const createResolveViewer = (deps: RouteDeps): AuthPreHandler => {
  return async (request) => {
    const token = parseBearerToken(request.headers.authorization);

    if (token) {
      const decoded = await deps.auth.verifyIdToken(token);

      if (decoded) {
        const viewer: Viewer = {
          userId: decoded.uid,
          email: decoded.email,
          name: decoded.name,
          avatarUrl: decoded.picture,
          isAdmin: decoded.admin === true
        };

        request.viewer = viewer;
        deps.repo.ensureUserFromViewer({
          ...viewer,
          ...deriveNameParts(viewer.name)
        });
        return;
      }
    }

    if (deps.env.ENABLE_DEV_AUTH) {
      request.viewer = {
        userId: deps.repo.getDefaultViewerId(),
        email: "demo@everides.app",
        name: "Avery Morgan",
        isAdmin: true
      };
      return;
    }
  };
};

export const createRequireViewer = (deps: RouteDeps): AuthPreHandler => {
  const resolveViewer = createResolveViewer(deps);

  return async (request: ViewerRequest, reply: FastifyReply) => {
    await resolveViewer(request, reply);

    if (!request.viewer) {
      reply.code(401).send({
        message: "Authentication required. Provide a Firebase ID token."
      });
    }
  };
};
