import React, { useState } from 'react';
import './EscapeSuccessPage.css';

function EscapeSuccessPage({ onRestart, onClose }) {
    const [isHovered, setIsHovered] = useState(false);
    
    console.log("EscapeSuccessPage 렌더링됨");

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: `url('${process.env.PUBLIC_URL}/resource.gif')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center center',
            color: 'white',
            fontSize: 'calc(10px + 2vmin)',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}>
            <h1 style={{ color: 'white', fontSize: '3rem' }}>탈출 성공!</h1>
            <p style={{
                fontSize: '1.2rem',
                marginBottom: '40px',
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold'
            }}>
                축하합니다! 모든 문제를 해결하고 성공적으로 탈출했습니다.
            </p>
            <button
                onClick={onRestart}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    padding: '16px 40px',
                    fontSize: '1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isHovered ? 'rgba(124, 124, 124, 0.5)' : 'rgba(46, 46, 46, 0.5)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
                    transition: 'background-color 0.3s ease'
                }}
            >
                다시 시작
            </button>
        </div>
    );
}

export default EscapeSuccessPage; 