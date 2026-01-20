import { useState, useEffect } from 'react';
import './UnoButton.css';

function UnoButton({ onClick }) {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  useEffect(() => {
    // Position aléatoire
    const randomTop = Math.random() * 60 + 20; // Entre 20% et 80%
    const randomLeft = Math.random() * 60 + 20; // Entre 20% et 80%
    setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
  }, []);

  return (
    <button
      className="uno-button"
      style={{ top: position.top, left: position.left }}
      onClick={onClick}
    >
      UNO !
    </button>
  );
}

export default UnoButton;
