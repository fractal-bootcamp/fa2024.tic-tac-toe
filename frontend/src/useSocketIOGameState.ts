import { io, Socket } from "socket.io-client";
import { useGameState } from "./useGameState";
import { useEffect, useRef, useState } from "react";

type SocketMessage =
  | { type: "move"; data: { index: number } }
  | { type: "reset" }
  | {
      type: "state";
      data: { board: (string | null)[] };
    };

// Create and return the socket instance
const useSocket = (url: string): [Socket | null, boolean] => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket.IO connection established");
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log(`Socket.IO disconnected: ${reason}`);
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url]);

  return [socketRef.current, isConnected];
};

const useSocketIO = (url: string) => {
  const [socket, isConnected] = useSocket(url);

  const emitMessage = (message: SocketMessage) => {
    if (socket?.connected) {
      socket.emit("game_event", message);
    } else {
      console.warn("Socket not connected. Message not sent:", message);
    }
  };

  const onMessage = (callback: (message: SocketMessage) => void) => {
    if (socket) {
      socket.on("game_event", (message) => {
        console.log("received message", message);
        callback(message);
      });
      return () => {
        socket.off("game_event", callback);
      };
    }
  };

  return {
    emitMove: (index: number) => emitMessage({ type: "move", data: { index } }),
    emitReset: () => emitMessage({ type: "reset" }),
    emitGameState: (board: (string | null)[]) =>
      emitMessage({ type: "state", data: { board } }),
    onMessage,
    isConnected,
  };
};

export const useSocketIOGameState = (url: string) => {
  // local state, local actions
  const {
    board,
    currentPlayer,
    winner,
    handleMove,
    resetGame,
    initializeBoard,
  } = useGameState();

  // socket actions
  const { emitMove, emitReset, emitGameState, onMessage, isConnected } = useSocketIO(url);

  useEffect(() => {
    const cleanup = onMessage(async (message) => {
      switch (message.type) {
        case "move":
          handleMove(message.data.index);
          break;
        case "reset":
          resetGame();
          break;
        case "state":
          console.log("received state", message.data);
          initializeBoard(message.data.board);
          break;
        default:
          console.warn("unknown message type", message);
      }
    });

    return cleanup;
  }, [onMessage, handleMove, resetGame, initializeBoard]);

  const handleSocketMove = (index: number) => {
    // make the move on the server
    emitMove(index);
    // make the move on the client
    const newBoard = handleMove(index);
    // send the new board to the server
    emitGameState(newBoard ?? []);
  };

  const handleSocketReset = () => {
    // reset the game on the server
    emitReset();
    // reset the game on the client
    resetGame();
  };

  return {
    board,
    currentPlayer,
    winner,
    handleMove: handleSocketMove,
    resetGame: handleSocketReset,
    isConnected,
  };
};
