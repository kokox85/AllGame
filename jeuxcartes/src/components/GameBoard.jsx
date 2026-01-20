import { useState, useEffect } from 'react';
import Card from './Card';
import UnoButton from './UnoButton';
import Rule67Button from './Rule67Button';
import './GameBoard.css';

function GameBoard({ gameState, playerId, onPlayCards, onPass, onSayUno, onCounterUno, onClick67, onExchangeCards, socket }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [showUnoButton, setShowUnoButton] = useState(false);
  const [showCounterUno, setShowCounterUno] = useState(false);
  const [unoTargetPlayer, setUnoTargetPlayer] = useState(null);
  const [show67Button, setShow67Button] = useState(false);

  const currentPlayer = gameState?.players?.find(p => p.id === playerId);
  const isMyTurn = gameState?.players?.[gameState.currentPlayerIndex]?.id === playerId;

  useEffect(() => {
    socket.on('unoAlert', ({ playerId: unoPlayerId }) => {
      if (unoPlayerId === playerId) {
        setShowUnoButton(true);
      } else {
        setShowCounterUno(true);
        setUnoTargetPlayer(unoPlayerId);
        setTimeout(() => {
          setShowCounterUno(false);
        }, 3000);
      }
    });

    socket.on('rule67Alert', () => {
      setShow67Button(true);
    });

    return () => {
      socket.off('unoAlert');
      socket.off('rule67Alert');
    };
  }, [socket, playerId]);

  const handleCardClick = (card) => {
    if (!isMyTurn || gameState.phase !== 'playing') return;

    const isSelected = selectedCards.some(c => c.suit === card.suit && c.value === card.value);
    
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => !(c.suit === card.suit && c.value === card.value)));
    } else {
      // Vérifier si la carte peut être ajoutée (même valeur)
      if (selectedCards.length === 0 || selectedCards[0].value === card.value) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const handlePlay = () => {
    if (selectedCards.length > 0) {
      onPlayCards(selectedCards);
      setSelectedCards([]);
    }
  };

  const handlePass = () => {
    onPass();
    setSelectedCards([]);
  };

  const handleUnoClick = () => {
    onSayUno();
    setShowUnoButton(false);
  };

  const handleCounterUno = () => {
    onCounterUno(unoTargetPlayer);
    setShowCounterUno(false);
  };

  const handle67Click = () => {
    onClick67();
    setShow67Button(false);
  };

  const canPlayCard = (card) => {
    if (!isMyTurn || selectedCards.length === 0) return true;
    return card.value === selectedCards[0].value;
  };

  const getLastPlay = () => {
    if (gameState.pile.length === 0) return null;
    const lastCard = gameState.pile[gameState.pile.length - 1];
    return gameState.pile.filter(c => c.value === lastCard.value).slice(-4);
  };

  const lastPlay = getLastPlay();

  // Phase d'échange
  if (gameState.phase === 'exchange') {
    return (
      <div className="game-board">
        {/* Nom du joueur actuel */}
        <div className="current-player-name">
          <h2>Joueur : {currentPlayer?.name}</h2>
        </div>

        <div className="exchange-phase">
          <h2>Phase d'échange de cartes</h2>
          <p>Rôle : <span className="role-badge">{currentPlayer.role}</span></p>
          
          {currentPlayer.role === 'Président' && (
            <div className="exchange-instructions">
              <p>Sélectionnez 2 cartes à donner au Trou Duc (vos plus petites cartes)</p>
            </div>
          )}
          
          {currentPlayer.role === 'Vice-Président' && (
            <div className="exchange-instructions">
              <p>Sélectionnez 1 carte à donner au Vice Trou Duc</p>
            </div>
          )}
          
          {currentPlayer.role === 'Vice Trou Duc' && (
            <div className="exchange-instructions">
              <p>Vous allez donner votre meilleure carte au Vice-Président</p>
            </div>
          )}
          
          {currentPlayer.role === 'Trou Duc' && (
            <div className="exchange-instructions">
              <p>Vous allez donner vos 2 meilleures cartes au Président</p>
            </div>
          )}

          <div className="hand">
            {currentPlayer?.hand?.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => handleCardClick(card)}
                selected={selectedCards.some(c => c.suit === card.suit && c.value === card.value)}
              />
            ))}
          </div>

          <button 
            onClick={() => onExchangeCards(selectedCards)}
            disabled={
              (currentPlayer.role === 'Président' && selectedCards.length !== 2) ||
              ((currentPlayer.role === 'Vice-Président') && selectedCards.length !== 1)
            }
            className="exchange-btn"
          >
            Valider l'échange
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-board">
      {/* Nom du joueur actuel */}
      <div className="current-player-name">
        <h2>Joueur : {currentPlayer?.name}</h2>
      </div>

      {/* En-tête avec infos de jeu */}
      <div className="game-header">
        <div className="game-info">
          <h3>Tour {gameState.roundNumber}</h3>
          <p>Votre rôle : <span className="role-badge">{currentPlayer?.role || 'Aucun'}</span></p>
        </div>
        
        <div className="turn-indicator">
          {isMyTurn ? (
            <span className="my-turn">À votre tour !</span>
          ) : (
            <span className="not-my-turn">
              Tour de {gameState.players[gameState.currentPlayerIndex]?.name}
            </span>
          )}
        </div>
      </div>

      {/* Autres joueurs */}
      <div className="other-players">
        {gameState.players
          .filter(p => p.id !== playerId)
          .map((player, index) => (
            <div key={index} className="other-player">
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <span className="player-role">{player.role}</span>
              </div>
              <div className="card-count">
                {player.hand.length} carte{player.hand.length > 1 ? 's' : ''}
              </div>
            </div>
          ))}
      </div>

      {/* Pile centrale */}
      <div className="pile-area">
        <h3>Dernières cartes jouées</h3>
        <div className="pile">
          {lastPlay && lastPlay.length > 0 ? (
            lastPlay.map((card, index) => (
              <Card key={index} card={card} disabled />
            ))
          ) : (
            <div className="empty-pile">Aucune carte jouée</div>
          )}
        </div>
      </div>

      {/* Main du joueur */}
      <div className="player-hand-area">
        <h3>Votre main ({currentPlayer?.hand?.length} cartes)</h3>
        <div className="hand">
          {currentPlayer?.hand?.map((card, index) => (
            <Card
              key={index}
              card={card}
              onClick={() => handleCardClick(card)}
              selected={selectedCards.some(c => c.suit === card.suit && c.value === card.value)}
              disabled={!canPlayCard(card)}
            />
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="action-buttons">
          <button 
            onClick={handlePlay}
            disabled={!isMyTurn || selectedCards.length === 0}
            className="play-btn"
          >
            Jouer ({selectedCards.length})
          </button>
          <button 
            onClick={handlePass}
            disabled={!isMyTurn}
            className="pass-btn"
          >
            Passer
          </button>
        </div>
      </div>

      {/* Bouton Uno */}
      {showUnoButton && (
        <UnoButton onClick={handleUnoClick} />
      )}

      {/* Bouton Contre Uno */}
      {showCounterUno && (
        <button className="counter-uno-btn" onClick={handleCounterUno}>
          Contre Uno !
        </button>
      )}

      {/* Bouton Règle 6-7 */}
      {show67Button && (
        <Rule67Button onClick={handle67Click} />
      )}

      {/* Écran de fin de partie */}
      {gameState.phase === 'finished' && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>Partie terminée !</h2>
            <div className="final-standings">
              {gameState.players
                .sort((a, b) => a.finishPosition - b.finishPosition)
                .map((player, index) => (
                  <div key={index} className="standing-item">
                    <span className="position">{player.finishPosition}.</span>
                    <span className="player-name">{player.name}</span>
                    <span className="final-role">{player.role}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;
