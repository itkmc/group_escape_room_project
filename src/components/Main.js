import React from 'react'; // useState는 더 이상 필요 없으므로 제거
import './DifficultyCard.css';

function Main({ onStartGame }) {
    // 닉네임과 showDifficulty 관련 상태 제거
    // const [nickname, setNickname] = useState('');
    // const [showDifficulty, setShowDifficulty] = useState(false);

    // handleSubmit 함수 제거
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     if (nickname.trim()) {
    //         setShowDifficulty(true);
    //     } else {
    //         alert('닉네임을 입력해주세요!');
    //     }
    // };

    const handleSelectDifficulty = (mode) => {
        if (mode === 'normal') {
            // onStartGame 함수를 호출할 때 닉네임 인자는 더 이상 전달하지 않습니다.
            onStartGame(); 
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
            height: '100vh',
            backgroundImage: `url('${process.env.PUBLIC_URL}/31.png')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center center',
            color: 'black',
            fontSize: 'calc(10px + 2vmin)'
        }}>
            <h1>Horror Escape Room</h1>
            {/* 닉네임 입력 관련 조건부 렌더링 제거, 바로 난이도 컨테이너 렌더링 */}
            <div className="difficulty-container">
                <div className="difficulty-card easy" onClick={() => handleSelectDifficulty('easy')} style={{ cursor: 'pointer' }}>
                    <h2>EASY</h2>
                    <p>저주의 수녀원</p>
                </div>
                <div className="difficulty-card normal" onClick={() => handleSelectDifficulty('normal')} style={{ cursor: 'pointer' }}>
                    <h2>NORMAL</h2>
                    <p>코드 블랙: 혼백의 해부</p>
                </div>
                <div className="difficulty-card hard" onClick={() => handleSelectDifficulty('hard')} style={{ cursor: 'pointer' }}>
                    <h2>HARD</h2>
                    <p>침묵의 집</p>
                </div>
            </div>
        </div>
    );
}

export default Main;