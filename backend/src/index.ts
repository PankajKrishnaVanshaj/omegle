// index.ts

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { UserManager } from "./managers/UserManger";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();

io.on("connection", (socket) => {
  console.log("A user connected");

  // Add user to user manager
  userManager.addUser("randomName", socket);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
    userManager.removeUser(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
