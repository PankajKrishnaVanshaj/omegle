// RoomManager.ts

import { User } from "./UserManger";

// Interface representing a room
interface Room {
  user1: User;
  user2: User;
}

// Class responsible for managing rooms
export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  // Method to create a room between two users
  createRoom(user1: User, user2: User) {
    // Generate a unique room ID
    const roomId = this.generateRoomId().toString();

    // Store the users in the room
    this.rooms.set(roomId, { user1, user2 });

    // Send an offer to both users
    user1.socket.emit("send-offer", { roomId });
    user2.socket.emit("send-offer", { roomId });
  }

  // Method to handle offer received from a user
  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    // Find the room associated with the provided room ID
    const room = this.rooms.get(roomId);

    if (!room) {
      return; // Room not found, do nothing
    }

    // Determine the receiving user based on the sender's socket ID
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    // Emit the offer to the receiving user
    receivingUser?.socket.emit("offer", { sdp, roomId });
  }

  // Method to handle answer received from a user
  onAnswer(roomId: string, sdp: string, senderSocketId: string) {
    // Find the room associated with the provided room ID
    const room = this.rooms.get(roomId);

    if (!room) {
      return; // Room not found, do nothing
    }

    // Determine the receiving user based on the sender's socket ID
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    // Emit the answer to the receiving user
    receivingUser?.socket.emit("answer", { sdp, roomId });
  }

  // Method to handle ICE candidates received from a user
  onIceCandidates(
    roomId: string,
    senderSocketId: string,
    candidate: any,
    type: "sender" | "receiver"
  ) {
    // Find the room associated with the provided room ID
    const room = this.rooms.get(roomId);

    if (!room) {
      return; // Room not found, do nothing
    }

    // Determine the receiving user based on the sender's socket ID
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    // Emit the ICE candidate to the receiving user
    receivingUser.socket.emit("ice-candidate", { candidate, type });
  }

  // Method to generate a unique room ID
  private generateRoomId() {
    return Math.floor(Math.random() * 1000000); // Example method, replace with your own logic
  }
}
