import { io, Socket } from "socket.io-client";
import { useGameState } from "./useGameState";
import { useEffect, useState } from "react";
import { BoardState, Player } from "./types";

type GameState = {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | "Draw" | null;
};

type SocketMessage =
  | { type: "move"; data: { index: number } }
  | { type: "reset" }
  | { type: "state"; data: GameState };

const createSocket = (url: string): Socket => {
  const socket = io(url, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

let globalSocket: Socket | null = null;

export const useSocket = (url: string): [Socket | null, boolean] => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!globalSocket || globalSocket.disconnected) {
      globalSocket = createSocket(url);
      setSocketInstance(globalSocket);

      globalSocket.on("connect", () => {
        console.log("Socket.IO connection established");
        setIsConnected(true);
      });

      globalSocket.on("disconnect", (reason) => {
        console.log(`Socket.IO disconnected: ${reason}`);
        setIsConnected(false);
      });

      globalSocket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
        setIsConnected(false);
      });
    }

    return () => {
      if (globalSocket) {
        globalSocket.disconnect();
      }
    };
  }, [url]);

  return [socketInstance, isConnected];
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

  const emitJoin = (roomId: string) => {
    if (socket?.connected) {
      socket.emit("join_room", roomId);
    } else {
      console.warn("Socket not connected. Join not sent:", roomId);
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
    emitJoin: (roomId: string) => emitJoin(roomId),
    onMessage,
    isConnected,
  };
};

export const useSocketIOGameState = (url: string, roomId: string) => {
  const { board, currentPlayer, winner, updateGameState } = useGameState();
  const { emitMove, emitReset, emitJoin, onMessage, isConnected } =
    useSocketIO(url);

  useEffect(() => {
    console.log("socketConnected", isConnected, roomId);
    if (isConnected && roomId) {
      console.log("emitting join_room", roomId);
      emitJoin(roomId);
    }
  }, [isConnected, roomId]);

  useEffect(() => {
    const cleanup = onMessage((message) => {
      if (message.type === "state") {
        updateGameState(message.data);
      }
    });

    return cleanup;
  }, [onMessage, updateGameState]);

  const handleMove = (index: number) => {
    emitMove(index);
  };

  const resetGame = () => {
    emitReset();
  };

  return {
    board,
    currentPlayer,
    winner,
    handleMove,
    resetGame,
    isConnected,
  };
};
