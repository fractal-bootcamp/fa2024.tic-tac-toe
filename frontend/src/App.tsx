import React, { useEffect, useState } from "react";
import "./App.css";
import { useSocket, useSocketIOGameState } from "./useSocketIOGameState";
import { BoardState, Player } from "./types";
import { Navigate, useParams } from "react-router-dom";

const Cell: React.FC<{ value: Player | null; onClick: () => void }> = ({
  value,
  onClick,
}) => (
  <button
    className="w-20 h-20 border border-gray-400 text-4xl font-bold focus:outline-none"
    onClick={onClick}
  >
    {value}
  </button>
);

const Board: React.FC<{
  board: BoardState;
  onCellClick: (index: number) => void;
}> = ({ board, onCellClick }) => (
  <div className="grid grid-cols-3 gap-1">
    {board.map((cell, index) => (
      <Cell key={index} value={cell} onClick={() => onCellClick(index)} />
    ))}
  </div>
);

const StatusMessage: React.FC<{
  winner: Player | "Draw" | null;
  currentPlayer: Player;
}> = ({ winner, currentPlayer }) => {
  switch (winner) {
    case "Draw":
      return <p>It's a Draw!</p>;
    case null:
      return <p>Current Player: {currentPlayer}</p>;
    default:
      return <p className="font-bold text-3xl">Winner: {winner}</p>;
  }
};

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    className="bg-blue-500 font-bold hover:bg-blue-700 mt-4 px-4 py-2 rounded text-white"
    onClick={onClick}
  >
    Reset Game
  </button>
);

const RoomInput: React.FC<{ onJoinRoom: (roomId: string) => void }> = ({
  onJoinRoom,
}) => {
  const [roomId, setRoomId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="border border-gray-300 px-2 py-1 rounded mr-2"
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-1 rounded"
      >
        Join Room
      </button>
    </form>
  );
};

function App({ roomId }: { roomId: string }) {
  const { board, currentPlayer, winner, handleMove, resetGame, isConnected } =
    useSocketIOGameState("http://localhost:3001", roomId);

   

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="font-bold mb-4 text-3xl">Tic Tac Toe</h1>
      <p className="mb-4">Room: {roomId}</p>
      <p className="mb-4">
        Connection status: {isConnected ? "Connected" : "Disconnected"}
      </p>
      <Board board={board} onCellClick={handleMove} />
      <StatusMessage winner={winner} currentPlayer={currentPlayer} />
      <ResetButton onClick={resetGame} />
    </div>
  );
}


export const AppWithParams = () => {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return <Navigate to="/" />;
  }

  return <App roomId={roomId} />;
}

export default App;
