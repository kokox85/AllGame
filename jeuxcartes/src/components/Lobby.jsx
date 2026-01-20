import { useState } from 'react';
import './Lobby.css';

function Lobby({ onCreateGame, onJoinGame, gameState, gameId }) {
  const [playerName, setPlayerName] = useState('');
  const [joinGameId, setJoinGameId] = useState('');

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onCreateGame(playerName);
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && joinGameId.trim()) {
      onJoinGame(joinGameId, playerName);
    }
  };

  return (
    <div className="lobby">
      <h1>Jeu du Président</h1>
      
      {!gameId ? (
        <div className="lobby-content">
          <div className="input-group">
            <input
              type="text"
              placeholder="Votre nom"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>

          <div className="button-group">
            <button className="create-btn" onClick={handleCreateGame}>
              Créer une partie
            </button>
            
            <div className="join-section">
              <input
                type="text"
                placeholder="Code de la partie"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
              />
              <button className="join-btn" onClick={handleJoinGame}>
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="waiting-room">
          <h2>Code de la partie : {gameId}</h2>
          <p>Partagez ce code avec vos amis</p>
          
          <div className="players-list">
            <h3>Joueurs connectés ({gameState?.players?.length || 0}/4)</h3>
            {gameState?.players?.map((player, index) => (
              <div key={index} className="player-item">
                {player.name}
                {player.role && <span className="role"> - {player.role}</span>}
              </div>
            ))}
          </div>
          
          {gameState?.players?.length < 4 && (
            <p className="waiting-text">En attente de {4 - (gameState?.players?.length || 0)} joueur(s)...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Lobby;
