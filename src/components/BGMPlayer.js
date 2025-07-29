import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

const BGMPlayer = forwardRef(({ src, isPlaying }, ref) => {
  const audioRef = useRef(null);

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    },
    play: () => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
  }));

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
});

export default BGMPlayer; 