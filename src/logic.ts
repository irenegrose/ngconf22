import { Commands, IGameState, IPlayer, DEFAULT_PLAYER_SIZE } from './models';

const coinCount = 100;

var sizeTimer = {};

export function getInitialState(): IGameState {
  return {
    players: [],
    coins: [],
    fieldSize: {
      width: 100,
      height: 100,
    },
    eliminatedPlayers: {},
  };
}

export function gameLogic(state: IGameState, commands: Commands): IGameState {
  evaluateCommands(state, commands);
  resolveCoinCollisions(state);
  resolvePlayerCollisions(state);
  addMoreCoins(state);
  return state;
}

function evaluateCommands(state: IGameState, commands: Commands) {
  Object.keys(commands).forEach((playerId) => {
    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return;
    }
    const command = commands[playerId];
    if (command === 'up') {
      const newY = player.y - 1;
      if (newY < 0) {
        return;
      }
      player.y = newY;
    } else if (command === 'down') {
      const newY = player.y + 1;
      if (newY > state.fieldSize.height) {
        return;
      }
      player.y = newY;
    } else if (command === 'left') {
      const newX = player.x - 1;
      if (newX < 0) {
        return;
      }
      player.x = newX;
    } else if (command === 'right') {
      const newX = player.x + 1;
      if (newX > state.fieldSize.width) {
        return;
      }
      player.x = newX;
    }
  });
}

function resolveCoinCollisions(state: IGameState) {
  state.coins.slice().forEach((coin) => {
    const player = state.players.find((p) => {
      const val = p.size == DEFAULT_PLAYER_SIZE ? 1 : 2;
      return Math.abs(p.x - coin.x) < val && Math.abs(p.y - coin.y) < val;
    });
    if (player) {
      if (!coin.isDeadly) {
        player.score++;
      }
      state.coins = state.coins.filter((c) => c !== coin); 
      if (coin.isSizeup) {
        player.size = DEFAULT_PLAYER_SIZE * 2;
        if (sizeTimer[player.id]) {
          clearTimeout(sizeTimer[player.id]);
        }
        sizeTimer[player.id] = setTimeout(() => {
          player.size = DEFAULT_PLAYER_SIZE;
        }, 5000);
      }
      else if (coin.isDeadly && player.score > 0) {
        const loss = player.score === 1 ? 1 : Math.floor(player.score / 2);
        if (loss > 0) {
          displayMessage(player, 'Lost ' + loss + (loss === 1 ? ' coin!' : ' coins!'));
          player.score -= loss;
        }
      }
      setPlayerColor(player);
    }
  });
}

function setPlayerColor(player: IPlayer) {
  if (player.score < 5) {
    player.color = '#9400d3';
  } else if (player.score < 10) {
    player.color = '#ab0069';
  } else if (player.score < 15) {
    player.color = '#0000ff';
  } else if (player.score < 20) {
    player.color = '#035408';
  } else if (player.score < 25) {
    player.color = '#ff7f00';
  } else if (player.score < 30) {
    player.color = '#ff0000';
  } else {
    player.color = '#000000';
  }
}

function resolvePlayerCollisions(state: IGameState) {
  state.players.slice().forEach((player) => {
    if (!state.players.includes(player)) {
      return;
    }
    const otherPlayer = state.players.find(
      (p) => p !== player && p.x === player.x && p.y === player.y
    );
    if (otherPlayer) {
      // const pool = 2;
      // const roll = Math.floor(Math.random() * pool);
      let winner: IPlayer;
      let loser: IPlayer;
      // if (roll === 1) {
      if (player.score > otherPlayer.score) {
        winner = player;
        loser = otherPlayer;
      } else {
        winner = otherPlayer;
        loser = player;
      }
      if (loser.score > 0) {
        winner.score += loser.score;
        displayMessage(winner, 'Stole ' + loser.score + ' coin(s) from ' + loser.name + '! 💸');
        loser.score = 0;
        displayMessage(loser, 'Player ' + winner.name + ' stole all your coins! 😬');
        setPlayerColor(winner);
        setPlayerColor(loser);
      }
    }
  });
}

function displayMessage(player: IPlayer, msg: string, timeout = 3000) {
  player.message.push(msg);
  setTimeout(() => {
    player.message = player.message.filter(m => m != msg);
  }, timeout);
}

function addMoreCoins(state: IGameState) {
  while (state.coins.length < coinCount) {
    const location = getUnoccupiedLocation(state);
    const isDeadly = Math.random() <= 0.15;
    const isSizeup = !isDeadly && Math.random() <= 0.2;
    state.coins.push({ ...location, isDeadly, isSizeup });
  }
}

export function getUnoccupiedLocation(state: IGameState): {
  x: number;
  y: number;
} {
  let location = null;
  while (!location) {
    const x = Math.floor(Math.random() * state.fieldSize.width);
    const y = Math.floor(Math.random() * state.fieldSize.height);
    if (state.players.find((p) => p.x === x && p.y === y)) {
      continue;
    }
    if (state.coins.find((c) => c.x === x && c.y === y)) {
      continue;
    }
    location = { x, y };
  }
  return location;
}
