import React, { useEffect, useRef } from "react";

const BGMPlayer = ({ src, isPlaying }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isPlaying]);

  return (
    <audio ref={audioRef} src={src} loop />
  );
};

export default BGMPlayer; 