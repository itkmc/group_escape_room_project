// src/components/Main.js
import React, { useState } from 'react';

function Main({ onStartGame }) {
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
        if (nickname.trim()) { // 닉네임이 비어있지 않은지 확인
            onStartGame(nickname.trim()); // App.js로 닉네임 전달 및 게임 시작 요청
        } else {
            alert('닉네임을 입력해주세요!');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh', // 화면 전체 높이 사용
            backgroundColor: '#282c34', // App.css와 유사한 배경색
            color: 'white',
            fontSize: 'calc(10px + 2vmin)' // 텍스트 크기 조절
        }}>
            <h1>게임에 오신 것을 환영합니다!</h1>
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
            {/* 기존 App.js의 내용 제거 또는 다른 곳으로 이동 */}
        </div>
    );
}

export default Main;