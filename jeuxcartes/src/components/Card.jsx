import './Card.css';

function Card({ card, onClick, selected, disabled }) {
  const getSuitSymbol = (suit) => {
    const symbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
      joker: '🃏'
    };
    return symbols[suit] || '';
  };

  const getColorClass = () => {
    if (card.suit === 'joker') return 'joker';
    if (card.suit === 'hearts' || card.suit === 'diamonds') return 'red';
    return 'black';
  };

  return (
    <div
      className={`card ${getColorClass()} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="card-value">{card.value}</div>
      <div className="card-suit">{getSuitSymbol(card.suit)}</div>
    </div>
  );
}

export default Card;
