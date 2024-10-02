import React, { useState } from "react";
import "./App.css";

type Player = "X" | "O";
type BoardState = (Player | null)[];

const winConditions = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

const initialBoardState = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

const checkWinner = (boardState: BoardState): Player | "Draw" | null => {
  for (const [a, b, c] of winConditions) {
    if (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      return boardState[a] as Player;
    }
  }

  return boardState.every((cell) => cell !== null) ? "Draw" : null;
};

const useGameState = () => {
  const [board, setBoard] = useState<BoardState>(initialBoardState);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);

  const handleMove = (index: number) => {
    // don't do anything if the cell is already taken or if there is a winner
    if (board[index] || winner) return;

    // update the board
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    // check for a winner
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
  };

  return { board, currentPlayer, winner, handleMove, resetGame };
};

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
    useGameState();

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
