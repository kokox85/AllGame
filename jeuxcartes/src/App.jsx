import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    socket.on('gameCreated', ({ gameId, playerId }) => {
      setGameId(gameId);
      setPlayerId(playerId);
    });

    socket.on('gameUpdate', (game) => {
      setGameState(game);
    });

    socket.on('gameStarted', (game) => {
      setGameState(game);
    });

    socket.on('unoAlert', ({ playerId: unoPlayerId }) => {
      // Géré dans GameBoard
    });

    socket.on('rule67Alert', () => {
      // Géré dans GameBoard
    });

    socket.on('error', (message) => {
      alert(message);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameUpdate');
      socket.off('gameStarted');
      socket.off('unoAlert');
      socket.off('rule67Alert');
      socket.off('error');
    };
  }, []);

  const createGame = (playerName) => {
    socket.emit('createGame', playerName);
  };

  const joinGame = (gameId, playerName) => {
    socket.emit('joinGame', { gameId, playerName });
    setGameId(gameId);
  };

  const playCards = (cards) => {
    socket.emit('playCards', { gameId, cards });
  };

  const pass = () => {
    socket.emit('pass', { gameId });
  };

  const sayUno = () => {
    socket.emit('sayUno', { gameId });
  };

  const counterUno = (targetPlayerId) => {
    socket.emit('counterUno', { gameId, targetPlayerId });
  };

  const click67 = () => {
    socket.emit('click67', { gameId });
  };

  const exchangeCards = (cards) => {
    socket.emit('exchangeCards', { gameId, cards });
  };

  return (
    <div className="App">
      {!gameState || gameState.phase === 'waiting' ? (
        <Lobby 
          onCreateGame={createGame}
          onJoinGame={joinGame}
          gameState={gameState}
          gameId={gameId}
        />
      ) : (
        <GameBoard
          gameState={gameState}
          playerId={playerId}
          onPlayCards={playCards}
          onPass={pass}
          onSayUno={sayUno}
          onCounterUno={counterUno}
          onClick67={click67}
          onExchangeCards={exchangeCards}
          socket={socket}
        />
      )}
    </div>
  );
}

export default App;
