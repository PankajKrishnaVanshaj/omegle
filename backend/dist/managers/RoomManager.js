"use strict";
// RoomManager.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
// Class responsible for managing rooms
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    // Method to create a room between two users
    createRoom(user1, user2) {
        // Generate a unique room ID
        const roomId = this.generateRoomId().toString();
        // Store the users in the room
        this.rooms.set(roomId, { user1, user2 });
        // Send an offer to both users
        user1.socket.emit("send-offer", { roomId });
        user2.socket.emit("send-offer", { roomId });
    }
    // Method to handle offer received from a user
    onOffer(roomId, sdp, senderSocketId) {
        // Find the room associated with the provided room ID
        const room = this.rooms.get(roomId);
        if (!room) {
            return; // Room not found, do nothing
        }
        // Determine the receiving user based on the sender's socket ID
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        // Emit the offer to the receiving user
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", { sdp, roomId });
    }
    // Method to handle answer received from a user
    onAnswer(roomId, sdp, senderSocketId) {
        // Find the room associated with the provided room ID
        const room = this.rooms.get(roomId);
        if (!room) {
            return; // Room not found, do nothing
        }
        // Determine the receiving user based on the sender's socket ID
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        // Emit the answer to the receiving user
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", { sdp, roomId });
    }
    // Method to handle ICE candidates received from a user
    onIceCandidates(roomId, senderSocketId, candidate, type) {
        // Find the room associated with the provided room ID
        const room = this.rooms.get(roomId);
        if (!room) {
            return; // Room not found, do nothing
        }
        // Determine the receiving user based on the sender's socket ID
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        // Emit the ICE candidate to the receiving user
        receivingUser.socket.emit("ice-candidate", { candidate, type });
    }
    // Method to generate a unique room ID
    generateRoomId() {
        return Math.floor(Math.random() * 1000000); // Example method, replace with your own logic
    }
}
exports.RoomManager = RoomManager;
