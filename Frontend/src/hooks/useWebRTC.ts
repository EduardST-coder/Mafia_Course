import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      
      videoTrackRef.current = stream.getVideoTracks()[0] || null;
      audioTrackRef.current = stream.getAudioTracks()[0] || null;
      
      setLocalStream(stream);
      console.log('✅ Камера і мікрофон отримані!');
    } catch (err) {
      console.error('❌ Помилка доступу до камери:', err);
      alert('Не вдалося отримати доступ до камери або мікрофона');
    }
  }, []);

  useEffect(() => {
    initLocalStream();
  }, [initLocalStream]);

  const toggleCamera = useCallback(() => {
    if (videoTrackRef.current) {
      videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
      setIsCameraOn(videoTrackRef.current.enabled);
    }
  }, []);

  // ✅ Повне вимкнення мікрофону — створюємо новий стрім без аудіо
  const toggleMic = useCallback(() => {
    if (isMicOn) {
      // ВИМКАЄМО — зупиняємо аудіо трек
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current = null;
      }
      
      // Створюємо новий стрім тільки з відео
      if (videoTrackRef.current) {
        const newStream = new MediaStream([videoTrackRef.current]);
        setLocalStream(newStream);
      }
      
      setIsMicOn(false);
      console.log('🔇 Мікрофон вимкнено');
    } else {
      // ВМИКАЄМО — отримуємо новий аудіо трек
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(audioStream => {
          const newAudioTrack = audioStream.getAudioTracks()[0];
          audioTrackRef.current = newAudioTrack;
          
          if (videoTrackRef.current) {
            const newStream = new MediaStream([videoTrackRef.current, newAudioTrack]);
            setLocalStream(newStream);
          } else {
            const newStream = new MediaStream([newAudioTrack]);
            setLocalStream(newStream);
          }
          
          setIsMicOn(true);
          console.log('🎤 Мікрофон увімкнено');
        })
        .catch(err => {
          console.error('❌ Помилка увімкнення мікрофона:', err);
        });
    }
  }, [isMicOn]);

  return {
    localStream,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
  };
}