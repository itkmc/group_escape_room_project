// src/App.js
import React, { useState } from 'react';
import './App.css'; // 기존 App.css는 여전히 사용

// 새로운 Main 컴포넌트 임포트
import Main from './components/Main';
// BabylonScene 컴포넌트 임포트 (src/components 폴더에 있다고 가정)
import BabylonScene from './BabylonScene'; // 이 경로는 실제 BabylonScene.js 파일 위치에 맞게 수정해주세요!

function App() {
    // 게임이 시작되었는지 여부를 관리하는 상태
    // 초기값은 false로 설정하여 Main.js가 먼저 보이도록 함
    const [isGameStarted, setIsGameStarted] = useState(false);
    // 사용자 닉네임 정보를 저장할 상태
    const [userNickname, setUserNickname] = useState('');

    // Main 컴포넌트에서 '게임 시작' 버튼을 눌렀을 때 호출될 함수
    const handleStartGame = (nickname) => {
        setUserNickname(nickname); // 닉네임 저장
        setIsGameStarted(true);    // isGameStarted 상태를 true로 변경하여 BabylonScene 렌더링
    };

    return (
        <div className="App">
            {/* 조건부 렌더링 */}
            {!isGameStarted ? (
                // isGameStarted가 false이면 Main 컴포넌트를 렌더링
                // Main 컴포넌트에 handleStartGame 함수를 prop으로 전달
                <Main onStartGame={handleStartGame} />
            ) : (
                // isGameStarted가 true이면 BabylonScene 컴포넌트를 렌더링
                // BabylonScene에 닉네임 정보가 필요하다면 userNickname prop으로 전달
                <BabylonScene userNickname={userNickname} />
            )}
        </div>
    );
}

export default App;