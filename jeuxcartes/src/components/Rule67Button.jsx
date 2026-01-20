import { useState, useEffect } from 'react';
import './Rule67Button.css';

function Rule67Button({ onClick }) {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [timeLeft, setTimeLeft] = useState(2);

  useEffect(() => {
    // Position aléatoire
    const randomTop = Math.random() * 60 + 20;
    const randomLeft = Math.random() * 60 + 20;
    setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });

    // Compte à rebours
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      className="rule67-button"
      style={{ top: position.top, left: position.left }}
      onClick={onClick}
    >
      <div className="rule67-text">6-7 !</div>
      <div className="rule67-timer">{timeLeft.toFixed(1)}s</div>
    </button>
  );
}

export default Rule67Button;
