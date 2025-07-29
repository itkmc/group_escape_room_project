import React, { useState, useEffect } from 'react';

const GameTimer = ({ isGameStarted, onTimeOver }) => {
  const [timeLeft, setTimeLeft] = useState(0.5 * 60); // 17분을 초로 변환
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isGameStarted && !isActive) {
      setIsActive(true);
    }
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // 시간이 다 되었을 때 타임오버 콜백 호출
      if (onTimeOver) {
        onTimeOver();
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isGameStarted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isGameStarted) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: timeLeft <= 60 ? '#ff4444' : '#ffffff', // 1분 이하면 빨간색
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '24px',
      fontWeight: 'bold',
      zIndex: 1000,
      fontFamily: 'monospace',
      border: timeLeft <= 60 ? '2px solid #ff4444' : '2px solid #ffffff'
    }}>
      {formatTime(timeLeft)}
    </div>
  );
};

export default GameTimer; 