import React from 'react';

// 'progress' prop을 받아서 진행률 바를 렌더링합니다.
// progress 값이 제공되지 않으면 기본값은 0입니다.
function LoadingScreen({ progress = 0 }) {
  // progress 값이 항상 0에서 100 사이에 있도록 클램핑합니다.
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `url('${process.env.PUBLIC_URL}/31.png')`,
      backgroundSize: 'cover',
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center center',
      color: 'white',
      fontSize: 'calc(10px + 2vmin)'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#fff' }}>게임 로딩 중...</h1>

        {/* 진행률 바 컨테이너 */}
        <div style={{
          width: '200px', // 진행률 바의 고정 너비
          height: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)', // 바의 빈 부분 색상
          borderRadius: '10px',
          overflow: 'hidden',
          margin: '0 auto 20px',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}>
          {/* 실제 진행률 바 */}
          <div style={{
            width: `${clampedProgress}%`, // 진행률에 따라 너비 설정
            height: '100%',
            backgroundColor: '#007bff', // 진행률 바의 채워지는 색상 (파란색)
            borderRadius: '10px',
            transition: 'width 1s linear' // 바가 부드럽게 채워지도록 전환 효과 추가
          }}></div>
        </div>

        {/* 퍼센트 텍스트 */}
        <p style={{ margin: '0', color: '#ccc', fontWeight: 'bold' }}>
          {Math.round(clampedProgress)}% 로딩 완료
        </p>

        <p style={{ margin: '10px 0 0 0', fontSize: '0.8em', color: '#999' }}>
          3D 환경을 준비하고 있습니다... 잠시만 기다려주세요
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
