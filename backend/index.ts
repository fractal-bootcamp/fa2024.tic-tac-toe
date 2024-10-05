import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  makeMove,
  resetGame,
  createRoom,
  type Room,
  addPlayerToRoom,
  removePlayerFromRoom,
} from "./gameEngine";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3001;

// { roomId: Room }
const rooms: Map<string, Room> = new Map();

enum MessageType {
  JOIN_ROOM = "join_room",
  ROOMS = "rooms",
  CREATE_ROOM = "create_room",
  GAME_EVENT = "game_event",
}

enum GameEventType {
  MOVE = "move",
  RESET = "reset",
  STATE = "state",
}

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send the list of rooms to the client
  socket.emit(MessageType.ROOMS, rooms);

  // Create a room
  socket.on(MessageType.CREATE_ROOM, (roomId: string) => {
    const room = createRoom(roomId);
    rooms.set(roomId, room);
    socket.broadcast.emit(MessageType.ROOMS, rooms);
  });

  socket.on(MessageType.JOIN_ROOM, (roomId: string) => {
    let room = rooms.get(roomId);

    // default to creating a room if it doesn't exist
    if (!room) {
      room = createRoom(roomId);
      rooms.set(roomId, room);
    }

    if (room.players.X && room.players.O) {
      return;
    }

    socket.join(roomId);

    // add the player to the room
    room = addPlayerToRoom(room, socket.id);
    rooms.set(roomId, room);

    // Emit the current game state to the joining player
    socket.emit(MessageType.GAME_EVENT, {
      type: GameEventType.STATE,
      data: room.gameState,
    });

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on(MessageType.GAME_EVENT, (message) => {
    const roomId = Array.from(socket.rooms).find((room) => room !== socket.id);
    if (!roomId) {
      console.warn("No room found for this socket");
      return;
    }

    let room = rooms.get(roomId);
    if (!room) {
      console.warn(`Room ${roomId} not found`);
      return;
    }

    console.log("Received game event:", message);

    switch (message.type) {
      case GameEventType.MOVE:
        // is it X or O's turn?
        const XorO = room.gameState.currentPlayer

        // grab the associated socket id
        if (room.players[XorO] !== socket.id) {
          console.warn(`Player ${socket.id} tried to make a move but it's not their turn`);
          return;
        }

        room.gameState = makeMove(room.gameState, message.data.index);
        break;
      case GameEventType.RESET:
        room.gameState = resetGame();
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }

    rooms.set(roomId, room);

    // Broadcast the updated game state to all clients in the room
    io.to(roomId).emit(MessageType.GAME_EVENT, {
      type: "state",
      data: room.gameState,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    rooms.forEach((room, roomId) => {
      if (room.players.X === socket.id || room.players.O === socket.id) {
        room = removePlayerFromRoom(room, socket.id);
        if (!room.players.X && !room.players.O) {
          rooms.delete(roomId);
        } else {
          rooms.set(roomId, room);
        }
      }
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
