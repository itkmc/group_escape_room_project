import React, { useState } from 'react';
import './ProblemModal.css';

const OperatingRoomProblemModal = ({ isOpen, onClose, onCorrectAnswer }) => {
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() === '410') {
      setMessage('정답입니다!');
      setIsCorrect(true);
      setTimeout(() => {
        onCorrectAnswer();
        onClose();
        setAnswer('');
        setMessage('');
        setIsCorrect(false);
      }, 1500);
    } else {
      setMessage('틀렸습니다. 다시 풀어보세요!');
      setAnswer('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="problem-modal-overlay">
      <div className="problem-modal">
        <div className="problem-header">
          <h2>수술실 문제</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="problem-content">
          <div className="problem-image">
            <img src="/수술실문제410.png" alt="수술실 문제" />
          </div>
          
          <form onSubmit={handleSubmit} className="answer-form">
            <div className="input-group">
              <label htmlFor="answer">정답을 입력하세요:</label>
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="정답을 입력하세요"
                disabled={isCorrect}
              />
            </div>
            
            <div className="button-group">
              <button type="submit" disabled={isCorrect}>
                제출
              </button>
              <button type="button" onClick={onClose}>
                취소
              </button>
            </div>
            
            {message && (
              <div className={`message ${isCorrect ? 'correct' : 'incorrect'}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OperatingRoomProblemModal; 