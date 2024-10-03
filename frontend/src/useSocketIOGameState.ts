import { io, Socket } from "socket.io-client";
import { useGameState } from "./useGameState";
import { useEffect, useRef } from "react";

type SocketMessage =
  | { type: "move"; data: { index: number } }
  | { type: "reset" }
  | {
      type: "state";
      data: (string | null)[];
    };

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
const useSocketIO = (url: string) => {
  const socket = useSocket(url);

  const emitMessage = (message: SocketMessage) => {
    if (socket?.connected) {
      socket.emit("game_event", message);
    } else {
      console.warn("Socket not connected. Message not sent:", message);
    }
  };

  const onMessage = (callback: (message: SocketMessage) => void) => {
    if (socket) {
      socket.on("game_event", callback);
      return () => {
        socket.off("game_event", callback);
      };
    }
  };

  return {
    emitMove: (index: number) => emitMessage({ type: "move", data: { index } }),
    emitReset: () => emitMessage({ type: "reset" }),
    emitGameState: (board: (string | null)[]) =>
      emitMessage({ type: "state", data: board }),
    onMessage,
  };
};

export const useSocketIOGameState = (url: string) => {
  // local state, local actions
  const { board, currentPlayer, winner, handleMove, resetGame, initializeBoard } =
    useGameState();

  // socket actions
  const { emitMove, emitReset, emitGameState, onMessage } = useSocketIO(url);

  useEffect(() => {
    onMessage((message) => {
      switch (message.type) {
        case "move":
          handleMove(message.data.index);
          break;
        case "reset":
          resetGame();
          break;
        case "state":
          console.log("received state", message.data);
          initializeBoard(message.data);
          break;
          default:
            console.warn("unknown message type", message);
      }
    });
  }, [onMessage, handleMove, resetGame]);

  const handleSocketMove = (index: number) => {
    // make the move on the server
    emitMove(index);
    // make the move on the client
    const newBoard = handleMove(index);
    // send the new board to the server
    emitGameState(newBoard);
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
  };
};
