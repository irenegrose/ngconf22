export const DEFAULT_COIN_COLOR = 'yellow';
export const DEFAULT_OTHER_PLAYER_COLOR = 'red';
export const DEFAULT_PLAYER_COLOR = '#9400d3';
export const DEFAULT_PLAYER_NAME = 'You';
export const DEFAULT_PLAYER_SIZE = 5;

export interface IGameState {
  players: IPlayer[];
  coins: ICoin[];
  fieldSize: {
    width: number;
    height: number;
  };
  eliminatedPlayers: Record<string, string>;
}

export interface IPlayer {
  id: string;
  name: string;
  score: number;
  size: number;
  color: string;
  x: number;
  y: number;
  message?: string[];
}

export interface ICoin {
  x: number;
  y: number;
  isDeadly?: boolean;
  isSizeup?: boolean;
}

export type Command = 'left' | 'right' | 'up' | 'down';
export type Commands = Record<string, Command>;
