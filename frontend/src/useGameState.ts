import { useState } from "react";
import { Player, BoardState } from "./types";

export const useGameState = () => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);

  const updateGameState = (newState: { board: BoardState; currentPlayer: Player; winner: Player | "Draw" | null }) => {
    setBoard(newState.board);
    setCurrentPlayer(newState.currentPlayer);
    setWinner(newState.winner);
  };

  return { board, currentPlayer, winner, updateGameState };
};