import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useGameState } from "./App";

interface SocketMessage {
  type: "move" | "reset" | "state";
  data: {
    index?: number;
    board?: (string | null)[];
    currentPlayer?: string;
    winner?: string | null;
  };
}

// Create and return the socket instance
const useSocket = (url: string): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket.IO connection established");
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log(`Socket.IO disconnected: ${reason}`);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url]);

  return socketRef.current;
};

// Create the interface for how we use the socket
export const useSocketIO = (url: string) => {
  const socket = useSocket(url);

  const emitMessage = useCallback((message: SocketMessage) => {
    if (socket?.connected) {
      socket.emit("game_event", message);
    } else {
      console.warn("Socket not connected. Message not sent:", message);
    }
  }, [socket]);

  const onMessage = useCallback((callback: (message: SocketMessage) => void) => {
    if (socket) {
      socket.on("game_event", callback);
      return () => {
        socket.off("game_event", callback);
      };
    }
  }, [socket]);

  return {
    emitMove: useCallback((index: number) => emitMessage({ type: "move", data: { index } }), [emitMessage]),
    emitReset: useCallback(() => emitMessage({ type: "reset", data: {} }), [emitMessage]),
    onMessage,
  };
};

// Plug the socket into the game state
export const useSocketIOGameState = (url: string) => {
  const { board, currentPlayer, winner, handleMove, resetGame } = useGameState();
  const { emitMove, emitReset, onMessage } = useSocketIO(url);

  useEffect(() => {
    const handleSocketMessage = (message: SocketMessage) => {
      switch (message.type) {
        case "move":
          if (message.data.index !== undefined) {
            handleMove(message.data.index);
          }
          break;
        case "reset":
          resetGame();
          break;
        case "state":
          // Handle incoming state updates if needed
          break;
      }
    };

    const cleanup = onMessage(handleSocketMessage);

    return () => {
      if (cleanup) cleanup();
    };
  }, [onMessage, handleMove, resetGame]);

  const handleLocalMove = useCallback((index: number) => {
    handleMove(index);
    emitMove(index);
  }, [handleMove, emitMove]);

  const handleLocalReset = useCallback(() => {
    resetGame();
    emitReset();
  }, [resetGame, emitReset]);

  return {
    board,
    currentPlayer,
    winner,
    handleMove: handleLocalMove,
    resetGame: handleLocalReset,
  };
};
