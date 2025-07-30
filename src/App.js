import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// 새로운 Main 컴포넌트 임포트
import Main from './components/Main';
// BabylonScene 컴포넌트 임포트 (src/components 폴더에 있다고 가정)
import BabylonScene from './BabylonScene'; // 일반적으로 components 폴더에 위치합니다.
// 로딩 화면 컴포넌트 임포트 (수정된 로딩 화면을 사용합니다)
import LoadingScreen from './components/LoadingScreen';
import BGMPlayer from './components/BGMPlayer';
import GameTimer from './components/GameTimer';
import TimeOverPage from './components/TimeOverPage';

function App() {
    // 게임이 시작되었는지 여부를 관리하는 상태
    // 초기값은 false로 설정하여 Main.js가 먼저 보이도록 함
    const [isGameStarted, setIsGameStarted] = useState(false);
    // 로딩 상태를 관리하는 상태
    const [isLoading, setIsLoading] = useState(false);
    // 로딩 진행률을 관리하는 상태 (0부터 100까지)
    const [loadingProgress, setLoadingProgress] = useState(0);
    // 타임오버 상태를 관리하는 상태
    const [showTimeOver, setShowTimeOver] = useState(false);

    // BGM 제어를 위한 ref
    const bgmRef = useRef(null);

    // Main 컴포넌트에서 '게임 시작' 버튼을 눌렀을 때 호출될 함수
    const handleStartGame = () => {
        console.log("게임 시작 버튼 클릭됨");
        setIsLoading(true);         // 로딩 시작
        setIsGameStarted(true);     // isGameStarted 상태를 true로 변경하여 BabylonScene 렌더링
        setLoadingProgress(0);      // 로딩 시작 시 진행률 초기화
        console.log("로딩 상태: true, 게임 시작 상태: true, 진행률: 0");
    };

    // BabylonScene이 로드 완료되었을 때 호출될 함수
    // 이 함수는 BabylonScene 내부의 모든 3D 리소스 로딩이 완료되었을 때 호출되어야 합니다.
    const handleGameLoaded = () => {
        console.log("handleGameLoaded 호출됨 - 로딩 완료");
        // 실제 게임 로딩이 완료되면 isLoading을 false로 설정합니다.
        // BabylonScene에서 이 함수를 호출할 때 최종적으로 로딩 화면이 사라집니다.
        setIsLoading(false);
        console.log("로딩 상태: false로 변경됨");
    };

    // 실제 로딩 진행률 업데이트 함수
    const handleLoadingProgress = (progress) => {
        console.log("실제 로딩 진행률:", progress);
        setLoadingProgress(progress);
    };

    // 게임 재시작 함수
    const handleGameRestart = () => {
        console.log("게임 재시작");
        setIsGameStarted(false);
        setIsLoading(false);
        setLoadingProgress(0); // 재시작 시 진행률도 초기화
        setShowTimeOver(false); // 타임오버 상태도 초기화
    };

    // 타임오버 핸들러 함수
    const handleTimeOver = () => {
        console.log("타임오버 발생");
        setShowTimeOver(true);
    };

    // 시뮬레이션 로딩 제거 - 실제 로딩 진행률 사용

    console.log("App 렌더링 중 - isGameStarted:", isGameStarted, "isLoading:", isLoading, "loadingProgress:", Math.round(loadingProgress));

    return (
        <div className="App">
            {/* 조건부 렌더링: isGameStarted 상태에 따라 Main 컴포넌트 또는 게임 컴포넌트 렌더링 */}
            {!isGameStarted ? (
                // isGameStarted가 false이면 Main 컴포넌트를 렌더링
                // Main 컴포넌트에 handleStartGame 함수를 prop으로 전달
                <Main onStartGame={handleStartGame} />
            ) : (
                // 게임이 시작되면 BabylonScene과 로딩 화면을 함께 렌더링
                <>
                    {/* 게임 타이머 */}
                    <GameTimer 
                        isGameStarted={isGameStarted && !isLoading} 
                        onTimeOver={handleTimeOver}
                    />
                    {/* BGMPlayer 추가: 로딩이 끝난 후에만 BGM 재생 (isGameStarted가 true이고 isLoading이 false일 때) */}
                    <BGMPlayer ref={bgmRef} src="/horror-background-atmosphere-156462.mp3" isPlaying={isGameStarted && !isLoading} />
                    
                    {/* isLoading이 true일 때만 LoadingScreen을 렌더링하고, progress prop 전달 */}
                    {isLoading && <LoadingScreen progress={loadingProgress} />}
                    
                    {/* 타임오버 페이지 */}
                    {showTimeOver && (
                        <TimeOverPage onRestart={handleGameRestart} />
                    )}
                    
                    {/* BabylonScene 렌더링 */}
                    <BabylonScene 
                        key="game-scene" // 컴포넌트 키를 사용하여 리마운트 시 강제 업데이트
                        onGameLoaded={handleGameLoaded} // 게임 로드 완료 시 호출될 함수
                        onGameRestart={handleGameRestart} // 게임 재시작 시 호출될 함수
                        onLoadingProgress={handleLoadingProgress} // 실제 로딩 진행률 업데이트 함수
                        bgmRef={bgmRef} // BGM 제어를 위한 ref 전달
                    />
                </>
            )}
        </div>
    );
}

export default App;