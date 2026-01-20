// Logique du jeu du Président
export class GameManager {
  constructor() {
    this.games = new Map();
  }

  createGame(playerId, playerName) {
    const gameId = Math.random().toString(36).substring(7);
    const game = new Game(gameId);
    game.addPlayer(playerId, playerName);
    this.games.set(gameId, game);
    return gameId;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  joinGame(gameId, playerId, playerName) {
    const game = this.games.get(gameId);
    if (game && game.players.length < 4) {
      game.addPlayer(playerId, playerName);
      return true;
    }
    return false;
  }

  startGame(gameId) {
    const game = this.games.get(gameId);
    if (game) {
      game.start();
    }
  }

  exchangeCards(gameId, playerId, cards) {
    const game = this.games.get(gameId);
    if (game) {
      return game.exchangeCards(playerId, cards);
    }
    return false;
  }

  playCards(gameId, playerId, cards) {
    const game = this.games.get(gameId);
    if (game) {
      return game.playCards(playerId, cards);
    }
    return { success: false };
  }

  pass(gameId, playerId) {
    const game = this.games.get(gameId);
    if (game) {
      game.pass(playerId);
    }
  }

  sayUno(gameId, playerId) {
    const game = this.games.get(gameId);
    if (game) {
      return game.sayUno(playerId);
    }
    return false;
  }

  counterUno(gameId, playerId, targetPlayerId) {
    const game = this.games.get(gameId);
    if (game) {
      return game.counterUno(playerId, targetPlayerId);
    }
    return false;
  }

  click67(gameId, playerId) {
    const game = this.games.get(gameId);
    if (game) {
      return game.click67(playerId);
    }
    return false;
  }

  getPlayer(gameId, playerId) {
    const game = this.games.get(gameId);
    if (game) {
      return game.players.find(p => p.id === playerId);
    }
    return null;
  }

  removePlayer(playerId) {
    for (const [gameId, game] of this.games) {
      const index = game.players.findIndex(p => p.id === playerId);
      if (index !== -1) {
        game.players.splice(index, 1);
        if (game.players.length === 0) {
          this.games.delete(gameId);
        }
      }
    }
  }
}

class Game {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.deck = [];
    this.pile = [];
    this.currentPlayerIndex = 0;
    this.passCount = 0;
    this.phase = 'waiting'; // waiting, exchange, playing, finished
    this.roundNumber = 0;
    this.unoPlayer = null;
    this.unoTimestamp = null;
    this.rule67Active = false;
    this.rule67Timestamp = null;
  }

  addPlayer(id, name) {
    const roles = ['Président', 'Vice-Président', 'Vice Trou Duc', 'Trou Duc'];
    this.players.push({
      id,
      name,
      hand: [],
      role: this.roundNumber === 0 ? null : roles[this.players.length],
      finished: false,
      finishPosition: null
    });
  }

  start() {
    this.roundNumber++;
    this.createDeck();
    this.dealCards();
    
    if (this.roundNumber === 1) {
      // Première partie: celui avec la Dame de Cœur commence
      const queenOfHeartsPlayer = this.players.findIndex(p => 
        p.hand.some(card => card.value === 'Q' && card.suit === 'hearts')
      );
      this.currentPlayerIndex = queenOfHeartsPlayer !== -1 ? queenOfHeartsPlayer : 0;
      this.phase = 'playing';
    } else {
      // Tours suivants: échange de cartes
      this.phase = 'exchange';
      this.assignRolesFromPreviousRound();
    }
  }

  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.deck = [];
    
    for (const suit of suits) {
      for (const value of values) {
        this.deck.push({ suit, value, strength: this.getCardStrength(value) });
      }
    }
    
    this.shuffleDeck();
  }

  getCardStrength(value) {
    const order = { '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12, '2': 14 };
    return order[value] || 0;
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCards() {
    this.players.forEach(player => {
      player.hand = [];
    });
    
    let playerIndex = 0;
    while (this.deck.length > 0) {
      this.players[playerIndex].hand.push(this.deck.pop());
      playerIndex = (playerIndex + 1) % this.players.length;
    }
    
    // Trier les mains
    this.players.forEach(player => {
      player.hand.sort((a, b) => b.strength - a.strength);
    });
  }

  assignRolesFromPreviousRound() {
    // Les rôles sont déjà assignés selon la position de fin du tour précédent
  }

  exchangeCards(playerId, cards) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.phase !== 'exchange') return false;

    // Logique d'échange selon les rôles
    const president = this.players.find(p => p.role === 'Président');
    const vicePresident = this.players.find(p => p.role === 'Vice-Président');
    const viceTrouDuc = this.players.find(p => p.role === 'Vice Trou Duc');
    const trouDuc = this.players.find(p => p.role === 'Trou Duc');

    // Implémenter l'échange selon les règles
    // Président <-> Trou Duc (2 cartes)
    // Vice-Président <-> Vice Trou Duc (1 carte)

    return true;
  }

  playCards(playerId, cards) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex !== this.currentPlayerIndex) {
      return { success: false };
    }

    const player = this.players[playerIndex];

    // Vérifier si les cartes sont valides
    if (!this.areCardsValid(cards)) {
      return { success: false };
    }

    // Retirer les cartes de la main
    cards.forEach(card => {
      const index = player.hand.findIndex(c => 
        c.suit === card.suit && c.value === card.value
      );
      if (index !== -1) {
        player.hand.splice(index, 1);
      }
    });

    // Ajouter à la pile
    this.pile.push(...cards);
    this.passCount = 0;

    // Vérifier règle 6-7
    const check67 = this.checkRule67();

    // Vérifier si le joueur a terminé
    if (player.hand.length === 0) {
      this.finishPlayer(playerIndex);
    }

    this.nextPlayer();

    return { success: true, check67 };
  }

  areCardsValid(cards) {
    // Vérifier que toutes les cartes ont la même valeur
    if (cards.length === 0) return false;
    
    const firstValue = cards[0].value;
    if (!cards.every(card => card.value === firstValue)) {
      return false;
    }

    // Vérifier que les cartes sont plus fortes que la pile
    if (this.pile.length > 0) {
      const lastPlay = this.getLastPlay();
      if (lastPlay.length !== cards.length) {
        return false;
      }
      
      const lastStrength = lastPlay[0].strength;
      const newStrength = cards[0].strength;
      
      if (newStrength <= lastStrength) {
        return false;
      }
    }

    return true;
  }

  getLastPlay() {
    // Retourner les dernières cartes jouées en un coup
    const result = [];
    for (let i = this.pile.length - 1; i >= 0; i--) {
      if (i === this.pile.length - 1 || this.pile[i].value === this.pile[this.pile.length - 1].value) {
        result.unshift(this.pile[i]);
      } else {
        break;
      }
    }
    return result;
  }

  pass(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex !== this.currentPlayerIndex) return;

    this.passCount++;
    
    if (this.passCount === 3) {
      // Le joueur précédent ramasse et recommence
      this.pile = [];
      this.passCount = 0;
      // Le prochain joueur est celui qui a joué en dernier
    } else {
      this.nextPlayer();
    }
  }

  nextPlayer() {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].finished);
  }

  finishPlayer(playerIndex) {
    const finishedCount = this.players.filter(p => p.finished).length;
    this.players[playerIndex].finished = true;
    this.players[playerIndex].finishPosition = finishedCount + 1;

    // Attribuer les rôles pour le prochain tour
    const roles = ['Président', 'Vice-Président', 'Vice Trou Duc', 'Trou Duc'];
    this.players[playerIndex].role = roles[finishedCount];

    // Vérifier si la partie est terminée
    const stillPlaying = this.players.filter(p => !p.finished);
    if (stillPlaying.length === 1) {
      stillPlaying[0].finished = true;
      stillPlaying[0].finishPosition = 4;
      stillPlaying[0].role = 'Trou Duc';
      this.phase = 'finished';
    }
  }

  sayUno(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player && player.hand.length === 1) {
      this.unoPlayer = playerId;
      this.unoTimestamp = Date.now();
      return true;
    }
    return false;
  }

  counterUno(playerId, targetPlayerId) {
    const targetPlayer = this.players.find(p => p.id === targetPlayerId);
    if (targetPlayer && targetPlayer.hand.length === 1 && this.unoPlayer !== targetPlayerId) {
      // Le joueur devient Trou Duc d'office
      targetPlayer.role = 'Trou Duc';
      this.reorganizeRoles(targetPlayerId);
      return true;
    }
    return false;
  }

  reorganizeRoles(trouDucPlayerId) {
    const roles = ['Président', 'Vice-Président', 'Vice Trou Duc', 'Trou Duc'];
    const oldTrouDuc = this.players.find(p => p.role === 'Trou Duc' && p.id !== trouDucPlayerId);
    if (oldTrouDuc) {
      oldTrouDuc.role = 'Vice Trou Duc';
    }
  }

  checkRule67() {
    if (this.pile.length >= 2) {
      const lastTwo = this.pile.slice(-2);
      if ((lastTwo[0].value === '6' && lastTwo[1].value === '7') ||
          (lastTwo[0].value === '7' && lastTwo[1].value === '6')) {
        this.rule67Active = true;
        this.rule67Timestamp = Date.now();
        
        setTimeout(() => {
          if (this.rule67Active) {
            // Personne n'a cliqué, le joueur actuel devient Trou Duc d'office
            const currentPlayer = this.players[this.currentPlayerIndex];
            currentPlayer.role = 'Trou Duc';
            this.reorganizeRoles(currentPlayer.id);
            this.rule67Active = false;
          }
        }, 2000);
        
        return true;
      }
    }
    return false;
  }

  click67(playerId) {
    if (this.rule67Active) {
      this.rule67Active = false;
      return true;
    }
    return false;
  }
}
