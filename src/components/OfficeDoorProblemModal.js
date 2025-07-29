import React, { useState } from 'react';
import './ProblemModal.css'; // ProblemModal.css 파일이 동일한 디렉토리에 있다고 가정합니다.

const OfficeDoorProblemModal = ({ isOpen, onClose, onCorrectAnswer }) => {
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  // 사무실 문 퀴즈의 올바른 정답으로 변경 (BabylonScene.js의 correctAnswer4와 일치)
  const correctAnswer = "1346"; 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() === correctAnswer) { // 대소문자 구분 없이 숫자로만 비교
      setMessage('정답입니다! 문이 열립니다.');
      setIsCorrect(true);
      setTimeout(() => {
        onCorrectAnswer(); // BabylonScene.js의 onCorrectAnswer 콜백 호출
        onClose(); // 모달 닫기
        setAnswer(''); // 입력 필드 초기화
        setMessage(''); // 메시지 초기화
        setIsCorrect(false); // 정답 상태 초기화
      }, 1500); // 1.5초 후 실행
    } else {
      setMessage('오답입니다. 다시 시도해 보세요!');
      setAnswer(''); // 오답 시 입력 필드 초기화
    }
  };

  if (!isOpen) return null; // isOpen이 false면 아무것도 렌더링하지 않음

  return (
    <div className="problem-modal-overlay">
      <div className="problem-modal">
        <div className="problem-header">
          {/* 퀴즈 제목을 사무실 문 퀴즈에 맞게 변경 */}
          <h2>사무실 문 문제</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="problem-content">
          <div className='problem-text'>
            {/* 퀴즈 내용을 사무실 문 퀴즈에 맞게 변경 */}
            <p>
              내가 좋아하는 계란 나오는 날은 체크 해놔야지~!!
            </p>
          </div>
          <div className="problem-image">
            {/* 사무실 문 퀴즈에 맞는 이미지로 변경 (예: 문이나 잠금장치 관련 이미지) */}
            <img src="/자물쇠1.png" alt="사무실 문 문제" /> 
            {/* 만약 다른 이미지가 있다면 해당 경로로 변경해주세요. */}
          </div>
          
          <form onSubmit={handleSubmit} className="answer-form">
            <div className="input-group">
              <label htmlFor="answer">비밀번호를 입력하세요(비밀번호는 작은수부터)</label>
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={isCorrect} // 정답 시 입력 비활성화
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
            
            {message && ( // 메시지가 있을 때만 표시
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

export default OfficeDoorProblemModal;
