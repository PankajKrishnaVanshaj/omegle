"use strict";
// index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const UserManger_1 = require("./managers/UserManger");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const userManager = new UserManger_1.UserManager();
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
