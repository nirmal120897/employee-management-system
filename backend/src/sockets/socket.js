import { Server } from "socket.io";
import { SOCKET_EVENTS } from "./socketEvents.js";
import {
  addOnlineUser,
  removeSocketEverywhere,
  getOnlineCount,
} from "./onlineTracker.js";

let io = null; // singleton reference

export const initSocket = (httpServer) => {
  if (io) {
    console.warn("Socket.IO already initialized - skipping re-init");
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on(SOCKET_EVENTS.CLIENT_JOIN, (userId) => {
      if (!userId) return;
      socket.data.userId = userId;
      addOnlineUser(userId, socket.id);
      io.emit(SOCKET_EVENTS.ONLINE_COUNT_CHANGED, {
        onlineCount: getOnlineCount(),
      });
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId || removeSocketEverywhere(socket.id);
      if (userId) {
        removeSocketEverywhere(socket.id);
        io.emit(SOCKET_EVENTS.ONLINE_COUNT_CHANGED, {
          onlineCount: getOnlineCount(),
        });
      }
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized yet. Call initSocket(server) first in server.js",
    );
  }
  return io;
};
