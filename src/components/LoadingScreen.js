import React from 'react';

function LoadingScreen() {
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
        
        {/* 로딩 스피너 */}
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.3)',
          borderTop: '5px solid #fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        
        <p style={{ margin: '0', color: '#ccc' }}>3D 환경을 준비하고 있습니다...</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '0.8em', color: '#999' }}>
          잠시만 기다려주세요
        </p>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen; 