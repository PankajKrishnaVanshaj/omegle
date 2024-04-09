// UserManager.ts

import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

// Interface representing a user
export interface User {
  socket: Socket;
  name: string;
}

// Class responsible for managing users
export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;

  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  // Method to add a user to the user manager
  addUser(name: string, socket: Socket) {
    // Add the user to the users array
    this.users.push({
      name,
      socket,
    });

    // Add the user's socket ID to the queue
    this.queue.push(socket.id);

    // Send a lobby event to the user's socket
    socket.emit("lobby");

    // Check if there are enough users in the queue to create a room
    this.clearQueue();

    // Initialize event handlers for the user's socket
    this.initHandlers(socket);
  }

  // Method to remove a user from the user manager
  removeUser(socketId: string) {
    // Find the user with the specified socket ID
    const userIndex = this.users.findIndex(
      (user) => user.socket.id === socketId
    );

    // Remove the user from the users array
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
    }

    // Remove the socket ID from the queue
    this.queue = this.queue.filter((id) => id !== socketId);
  }

  // Method to check if there are enough users in the queue to create a room
  clearQueue() {
    // Check if there are at least two users in the queue
    if (this.queue.length < 2) {
      return;
    }

    // Remove two users from the queue
    const [id1, id2] = [this.queue.pop(), this.queue.pop()];

    // Find the users with the specified socket IDs
    const user1 = this.users.find((user) => user.socket.id === id1);
    const user2 = this.users.find((user) => user.socket.id === id2);

    // If both users exist, create a room between them
    if (user1 && user2) {
      this.roomManager.createRoom(user1, user2);
    }

    // Recursively check the queue for more users
    this.clearQueue();
  }

  // Method to initialize event handlers for a user's socket
  initHandlers(socket: Socket) {
    // Handle 'offer' events
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onOffer(roomId, sdp, socket.id);
    });

    // Handle 'answer' events
    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onAnswer(roomId, sdp, socket.id);
    });

    // Handle 'add-ice-candidate' events
    socket.on("ice-candidate", ({ candidate, roomId, type }) => {
      this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
    });
  }
}
