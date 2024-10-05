export type Player = "X" | "O";
export type BoardState = (Player | null)[];

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | "Draw" | null;
}

export const createInitialGameState = (): GameState => ({
  board: Array(9).fill(null),
  currentPlayer: "X",
  winner: null,
});

const checkWinner = (board: BoardState): Player | "Draw" | null => {
  for (const [a, b, c] of winConditions) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }
  return board.every((cell) => cell !== null) ? "Draw" : null;
};

export const makeMove = (gameState: GameState, index: number): GameState => {
  if (gameState.board[index] || gameState.winner) return gameState;

  const newBoard = [...gameState.board];
  newBoard[index] = gameState.currentPlayer;

  const newWinner = checkWinner(newBoard);
  const newCurrentPlayer = gameState.currentPlayer === "X" ? "O" : "X";

  return {
    board: newBoard,
    currentPlayer: newCurrentPlayer,
    winner: newWinner,
  };
};

export const resetGame = (): GameState => createInitialGameState();

// everything above is pretty much copy-pasted from the client

export interface Room {
  id: string;
  gameState: GameState;
  players: {
    X?: string;
    O?: string;
  };
}

export const createRoom = (id: string): Room => ({
  id,
  gameState: createInitialGameState(),
  players: {
    X: undefined,
    O: undefined,
  },
});

export const addPlayerToRoom = (room: Room, playerId: string): Room => {
  const playerSymbol = (() => {
    switch (true) {
      case room.players.X === undefined:
        return "X";
      case room.players.O === undefined:
        return "O";
      default:
        return null;
    }
  })();

  if (!playerSymbol) {
    return room;
  }

  return {
    ...room,
    players: {
      ...room.players,
      [playerSymbol]: playerId,
    },
  };
};

export const removePlayerFromRoom = (room: Room, playerId: string): Room => {
  const playerSymbol = (() => {
    switch (true) {
      case room.players.X === playerId:
        return "X";
      case room.players.O === playerId:
        return "O";
      default:
        return null;
    }
  })();

  if (!playerSymbol) {
    return room;
  }

  return {
    ...room,
    players: {
      ...room.players,
      [playerSymbol]: undefined,
    },
  };
};
