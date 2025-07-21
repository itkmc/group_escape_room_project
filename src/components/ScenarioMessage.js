// CenterMessage.js
import React from 'react';

// onClose prop이 선택적임을 나타내기 위해 기본값으로 undefined 설정
export default function ScenarioMessage({ message, visible, onClose = undefined }) { 
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.5)", // 배경을 어둡게 하여 메시지에 집중
      zIndex: 3000
    }}>
      <div style={{
    backgroundImage: `url('${process.env.PUBLIC_URL}/2.png')`,
    borderRadius: 10,
    padding: "36px 36px",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    textAlign: "center",
    letterSpacing: "0.02em",
    whiteSpace: "pre-line",
    position: 'relative',
    maxWidth: '80%',
    boxSizing: 'border-box',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
}}>
        {/* onClose prop이 존재할 때만 닫기 버튼을 렌더링 */}
        {onClose && (
          <button
            onClick={onClose} 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '0 5px',
            }}
          >
            X
          </button>
        )}

        {message}
      </div>
    </div>
  );
}