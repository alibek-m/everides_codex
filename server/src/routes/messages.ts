import type { FastifyPluginAsync } from "fastify";
import type { RouteDeps } from "../types";
import { createRequireViewer } from "../utils/auth";

type MessagesPlugin = FastifyPluginAsync<RouteDeps>;

export const messageRoutes: MessagesPlugin = async (app, deps) => {
  const requireViewer = createRequireViewer(deps);

  app.get("/threads", { preHandler: requireViewer }, async (request) => ({
    threads: deps.repo.listThreads(request.viewer!.userId)
  }));

  app.get("/thread/:bookingId", { preHandler: requireViewer }, async (request) => {
    const { bookingId } = request.params as { bookingId: string };
    return {
      messages: deps.repo.listMessages(bookingId)
    };
  });

  app.post("/", { preHandler: requireViewer }, async (request) => {
    const message = deps.repo.createMessage(request.viewer!.userId, request.body);
    deps.realtime.publish(
      `messages:${message.bookingId}`,
      "message:created",
      message
    );
    return {
      message
    };
  });

  app.patch("/:id/read", { preHandler: requireViewer }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const message = deps.repo.markMessageRead(id, request.viewer!.userId);
    if (!message) {
      return reply.code(404).send({
        message: "Message not found."
      });
    }
    return {
      message
    };
  });

  app.get(
    "/live/:bookingId",
    { websocket: true, preHandler: requireViewer },
    async (socket, request) => {
      const { bookingId } = request.params as { bookingId: string };
      deps.realtime.subscribe(`messages:${bookingId}`, socket);
      socket.send(
        JSON.stringify({
          event: "message:ready",
          payload: {
            bookingId
          }
        })
      );
    }
  );
};
