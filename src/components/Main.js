// ... existing code ...
import React, { useState } from 'react';
import './DifficultyCard.css';

function Main({ onStartGame }) {
    const [nickname, setNickname] = useState('');
    const [showDifficulty, setShowDifficulty] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nickname.trim()) {
            setShowDifficulty(true); // 난이도 선택 창 표시
        } else {
            alert('닉네임을 입력해주세요!');
        }
    };

    const handleSelectDifficulty = (mode) => {
        if (mode === 'normal') {
            onStartGame(nickname.trim()); // 노멀모드: 기존 게임 시작
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
            backgroundSize: 'cover',   // 이미지가 di  v를 꽉 채우도록 조절 (비율 유지)
            backgroundRepeat: 'repeat', // 이미지를 반복하여 채울 경우 (패턴 텍스처에 적합)
            backgroundPosition: 'center center', // 이미지를 중앙에 위치
            color: 'white',
            fontSize: 'calc(10px + 2vmin)' // 텍스트 크기 조절
        }}>
            <h1>게임에 오신 것을 환영합니다!</h1>
            {!showDifficulty ? (
                <>
                    <p>시작하려면 닉네임을 입력해주세요.</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임"
                            style={{
                                padding: '12px 15px',
                                fontSize: '18px',
                                borderRadius: '5px',
                                border: '1px solid #61dafb',
                                marginRight: '10px',
                                backgroundColor: '#383c44',
                                color: 'white'
                            }}
                            required
                        />
                        <button type="submit" style={{
                            padding: '12px 20px',
                            fontSize: '18px',
                            borderRadius: '5px',
                            border: 'none',
                            backgroundColor: '#61dafb',
                            color: '#282c34',
                            cursor: 'pointer'
                        }}>
                            게임 시작
                        </button>
                    </form>
                </>
            ) :
                <div className="difficulty-container">
                    <div className="difficulty-card easy" onClick={() => handleSelectDifficulty('easy')} style={{ cursor: 'pointer' }}>
                        <h2>EASY</h2>
                        <p>저주의 수녀원</p>
                    </div>
                    <div className="difficulty-card normal" onClick={() => handleSelectDifficulty('normal')} style={{ cursor: 'pointer' }}>
                        <h2>NORMAL</h2>
                        <p>코드 블랙: 탈출자는 없다</p>
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
// ... existing code ...