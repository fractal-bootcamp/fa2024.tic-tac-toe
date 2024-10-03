import { useState } from "react";

export type Player = "X" | "O";
export type BoardState = (Player | null)[];

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

export const useGameState = () => {
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

    return newBoard;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
  };

  const initializeBoard = (board: BoardState) => {
    console.log("initializing board", board);
    setBoard(board);
  };

  return { board, currentPlayer, winner, handleMove, resetGame, initializeBoard };
};