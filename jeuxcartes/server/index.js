import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './gameLogic.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const gameManager = new GameManager();

// Fonction pour filtrer l'état du jeu pour chaque joueur
function getGameStateForPlayer(game, playerId) {
  if (!game) return null;
  
  const gameState = {
    id: game.id,
    pile: [...game.pile],
    currentPlayerIndex: game.currentPlayerIndex,
    passCount: game.passCount,
    phase: game.phase,
    roundNumber: game.roundNumber,
    unoPlayer: game.unoPlayer,
    unoTimestamp: game.unoTimestamp,
    rule67Active: game.rule67Active,
    rule67Timestamp: game.rule67Timestamp,
    players: game.players.map(player => {
      if (player.id === playerId) {
        // Le joueur voit sa propre main
        return {
          id: player.id,
          name: player.name,
          hand: [...player.hand],
          role: player.role,
          finished: player.finished,
          finishPosition: player.finishPosition
        };
      } else {
        // Les autres joueurs : cacher leurs cartes
        return {
          id: player.id,
          name: player.name,
          hand: new Array(player.hand.length).fill({ hidden: true }),
          role: player.role,
          finished: player.finished,
          finishPosition: player.finishPosition
        };
      }
    })
  };
  
  return gameState;
}

io.on('connection', (socket) => {
  console.log('Joueur connecté:', socket.id);

  socket.on('createGame', (playerName) => {
    const gameId = gameManager.createGame(socket.id, playerName);
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, playerId: socket.id });
    
    // Envoyer l'état initial du jeu
    const game = gameManager.getGame(gameId);
    socket.emit('gameUpdate', getGameStateForPlayer(game, socket.id));
  });

  socket.on('joinGame', ({ gameId, playerName }) => {
    const success = gameManager.joinGame(gameId, socket.id, playerName);
    if (success) {
      socket.join(gameId);
      const game = gameManager.getGame(gameId);
      
      // Envoyer à chaque joueur sa propre version du jeu
      game.players.forEach(player => {
        io.to(player.id).emit('gameUpdate', getGameStateForPlayer(game, player.id));
      });
      
      if (game.players.length === 4) {
        gameManager.startGame(gameId);
        const updatedGame = gameManager.getGame(gameId);
        game.players.forEach(player => {
          io.to(player.id).emit('gameStarted', getGameStateForPlayer(updatedGame, player.id));
        });
      }
    } else {
      socket.emit('error', 'Impossible de rejoindre la partie');
    }
  });

  socket.on('exchangeCards', ({ gameId, cards }) => {
    const result = gameManager.exchangeCards(gameId, socket.id, cards);
    if (result) {
      const game = gameManager.getGame(gameId);
      game.players.forEach(player => {
        io.to(player.id).emit('gameUpdate', getGameStateForPlayer(game, player.id));
      });
    }
  });

  socket.on('playCards', ({ gameId, cards }) => {
    const result = gameManager.playCards(gameId, socket.id, cards);
    if (result.success) {
      const game = gameManager.getGame(gameId);
      game.players.forEach(player => {
        io.to(player.id).emit('gameUpdate', getGameStateForPlayer(game, player.id));
      });
      
      // Vérifier règle Uno
      const player = gameManager.getPlayer(gameId, socket.id);
      if (player.hand.length === 1) {
        io.to(gameId).emit('unoAlert', { playerId: socket.id });
      }
      
      // Vérifier règle 6-7
      if (result.check67) {
        io.to(gameId).emit('rule67Alert', {});
      }
    }
  });

  socket.on('pass', ({ gameId }) => {
    gameManager.pass(gameId, socket.id);
    const game = gameManager.getGame(gameId);
    game.players.forEach(player => {
      io.to(player.id).emit('gameUpdate', getGameStateForPlayer(game, player.id));
    });
  });

  socket.on('sayUno', ({ gameId }) => {
    const result = gameManager.sayUno(gameId, socket.id);
    const game = gameManager.getGame(gameId);
    game.players.forEach(player => {
      io.to(player.id).emit('gameUpdate', getGameStateForPlayer(game, player.id));
    });
  });

  socket.on('counterUno', ({ gameId, targetPlayerId }) => {
    const result = gameManager.counterUno(gameId, socket.id, targetPlayerId);
    const game = gameManager.getGame(gameId);
    game.players.forEach(player => {
      io.to(player.id).emit('gameUpdate', getGameStateForPlayer(game, player.id));
    });
  });

  socket.on('click67', ({ gameId }) => {
    const result = gameManager.click67(gameId, socket.id);
    const game = gameManager.getGame(gameId);
    game.players.forEach(player => {
      io.to(player.id).emit('gameUpdate', getGameStateForPlayer(game, player.id));
    });
  });

  socket.on('disconnect', () => {
    console.log('Joueur déconnecté:', socket.id);
    gameManager.removePlayer(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
