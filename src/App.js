import React, { useState } from 'react';
import './App.css';

// 새로운 Main 컴포넌트 임포트
import Main from './components/Main';
// BabylonScene 컴포넌트 임포트 (src/components 폴더에 있다고 가정)
import BabylonScene from './BabylonScene';
// 로딩 화면 컴포넌트 임포트
import LoadingScreen from './components/LoadingScreen';
import BGMPlayer from './components/BGMPlayer';

function App() {
    // 게임이 시작되었는지 여부를 관리하는 상태
    // 초기값은 false로 설정하여 Main.js가 먼저 보이도록 함
    const [isGameStarted, setIsGameStarted] = useState(false);
    // 로딩 상태를 관리하는 상태
    const [isLoading, setIsLoading] = useState(false);
    // 사용자 닉네임 정보를 저장할 상태 (제거됨)
    // const [userNickname, setUserNickname] = useState('');

    // Main 컴포넌트에서 '게임 시작' 버튼을 눌렀을 때 호출될 함수
    // 닉네임 인자를 받지 않음
    const handleStartGame = () => {
        console.log("게임 시작 버튼 클릭됨");
        // 닉네임 저장 로직 제거
        // setUserNickname(nickname);
        setIsLoading(true);         // 로딩 시작
        setIsGameStarted(true);     // isGameStarted 상태를 true로 변경하여 BabylonScene 렌더링
        console.log("로딩 상태: true, 게임 시작 상태: true");
    };

    // BabylonScene이 로드 완료되었을 때 호출될 함수
    const handleGameLoaded = () => {
        console.log("handleGameLoaded 호출됨 - 로딩 완료");
        setIsLoading(false);        // 로딩 완료
        console.log("로딩 상태: false로 변경됨");
    };

    // 게임 재시작 함수
    const handleGameRestart = () => {
        console.log("게임 재시작");
        setIsGameStarted(false);
        setIsLoading(false);
    };

    console.log("App 렌더링 - isGameStarted:", isGameStarted, "isLoading:", isLoading);
    
    return (
        <div className="App">
            {/* 조건부 렌더링 */}
            {!isGameStarted ? (
                // isGameStarted가 false이면 Main 컴포넌트를 렌더링
                // Main 컴포넌트에 handleStartGame 함수를 prop으로 전달
                <Main onStartGame={handleStartGame} />
            ) : (
                // 게임이 시작되면 BabylonScene과 로딩 화면을 함께 렌더링
                <>
                    {/* BGMPlayer 추가: 로딩이 끝난 후에만 BGM 재생 */}
                    <BGMPlayer src="/horror-background-atmosphere-156462.mp3" isPlaying={isGameStarted && !isLoading} />
                    {isLoading && <LoadingScreen />}
                    <BabylonScene 
                        key="game-scene" 
                        onGameLoaded={handleGameLoaded}
                        onGameRestart={handleGameRestart}
                        /* userNickname={userNickname} */ 
                    />
                </>
            )}
        </div>
    );
}

export default App;