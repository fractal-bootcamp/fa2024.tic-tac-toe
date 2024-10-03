import React from "react";
import "./App.css";
import { useSocketIOGameState } from "./useSocketIOGameState";
import { BoardState, Player } from "./useGameState";




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

function App() {
  const { board, currentPlayer, winner, handleMove, resetGame } =
    useSocketIOGameState("http://localhost:3001");

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="font-bold mb-4 text-3xl">Tic Tac Toe</h1>
      <Board board={board} onCellClick={handleMove} />
      <StatusMessage winner={winner} currentPlayer={currentPlayer} />
      <ResetButton onClick={resetGame} />
    </div>
  );
}

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

export default App;
