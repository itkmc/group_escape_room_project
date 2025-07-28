import React from 'react';
import './ProblemModal.css';

const OperatingRoomProblemModal = ({ isOpen, onClose, onCorrectAnswer }) => {
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
          
          <div className="button-group" style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatingRoomProblemModal; 