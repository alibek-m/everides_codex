type SocketLike = {
  send: (payload: string) => void;
  close: () => void;
  on: (event: "close" | "error", listener: () => void) => void;
};

export class RealtimeHub {
  private rooms = new Map<string, Set<SocketLike>>();

  subscribe(room: string, socket: SocketLike) {
    const sockets = this.rooms.get(room) ?? new Set<SocketLike>();
    sockets.add(socket);
    this.rooms.set(room, sockets);

    const cleanup = () => {
      const active = this.rooms.get(room);
      if (!active) {
        return;
      }

      active.delete(socket);
      if (active.size === 0) {
        this.rooms.delete(room);
      }
    };

    socket.on("close", cleanup);
    socket.on("error", cleanup);
  }

  publish(room: string, event: string, payload: unknown) {
    const sockets = this.rooms.get(room);
    if (!sockets) {
      return;
    }

    const message = JSON.stringify({
      event,
      payload
    });

    for (const socket of sockets) {
      try {
        socket.send(message);
      } catch {
        socket.close();
      }
    }
  }
}
