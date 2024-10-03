import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 3001;

const gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit('game_event', { type: 'state', data: gameState.board });

  // Listen for game events from the client
  socket.on('game_event', (message) => {
    // update the game state
    console.log('Received game event:', message);

    if (message.type === 'state') {
      gameState.board = message.data;
    }

    // Broadcast the game event to all connected clients after a short delay
    setTimeout(() => {
      socket.broadcast.emit('game_event', message);
    }, 500); // 100ms delay, adjust as needed
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});