// ... existing code ...
import React, { useState } from 'react';
import './DifficultyCard.css';

function Main({ onStartGame }) {
    const [showDifficulty, setShowDifficulty] = useState(false);
    const [isHovered, setIsHovered] = useState(false); // Hover 상태 추가

    const handleStartClick = () => {
        setShowDifficulty(true);
    };

    const handleSelectDifficulty = (mode) => {
        if (mode === 'normal') {
            onStartGame(); // 닉네임 없이 게임 시작
        } else {
            alert('아직 구현되지 않은 모드입니다! (노멀모드만 시작 가능)');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh', // 화면 전체 높이 사용
            backgroundImage: `url('${process.env.PUBLIC_URL}/31.png')`,
            backgroundSize: 'cover',   // 이미지가 div를 꽉 채우도록 조절 (비율 유지)
            backgroundRepeat: 'repeat', // 이미지를 반복하여 채울 경우 (패턴 텍스처에 적합)
            backgroundPosition: 'center center', // 이미지를 중앙에 위치
            color: 'black',
            fontSize: 'calc(10px + 2vmin)', // 텍스트 크기 조절
            userSelect: 'none'    
        }}>
            <h1>Escape 404</h1>
            {!showDifficulty ? (
                <button
                    onClick={handleStartClick}
                    // 마우스 이벤트 핸들러 추가
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        padding: '16px 40px',
                        fontSize: '1.5rem',
                        borderRadius: '10px',
                        border: 'none',
                        // hover 상태에 따라 배경색 변경
                        backgroundColor: isHovered ? 'rgba(124, 124, 124, 0.5)' : 'rgba(46, 46, 46, 0.5)',
                        color: 'black',
                        cursor: 'pointer',
                        marginTop: '40px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
                        transition: 'background-color 0.3s ease' // 부드러운 전환 효과 추가
                    }}
                >
                    시작하기
                </button>
            ) :
                <div className="difficulty-container">
                    <div className="difficulty-card easy" onClick={() => handleSelectDifficulty('easy')} style={{ cursor: 'pointer' }}>
                        <h2>EASY</h2>
                        <p>저주의 수녀원</p>
                    </div>
                    <div className="difficulty-card normal" onClick={() => handleSelectDifficulty('normal')} style={{ cursor: 'pointer' }}>
                        <h2>NORMAL</h2>
                        <p>코드 블랙: 사라진 환자들</p>
                    </div>
                    <div className="difficulty-card hard" onClick={() => handleSelectDifficulty('hard')} style={{ cursor: 'pointer' }}>
                        <h2>HARD</h2>
                        <p>침묵의 집</p>
                    </div>
                </div>
            }
        </div>
    );
}

export default Main;