// Frontend/src/hooks/useWebRTC.ts
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseWebRTCProps {
  roomId: string;
  token: string;
  userId: string | null;
}

export function useWebRTC({ roomId, token, userId }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams] = useState<Map<string, MediaStream>>(() => new Map());
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  // Використовуємо всі параметри
  useEffect(() => {
    console.log('WebRTC initialized:', { roomId, token, userId });
  }, [roomId, token, userId]);

  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      videoTrackRef.current = stream.getVideoTracks()[0] || null;
      audioTrackRef.current = stream.getAudioTracks()[0] || null;
      setLocalStream(stream);
    } catch (err) {
      console.error('WebRTC error:', err);
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

  const toggleMic = useCallback(() => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
      setIsMicOn(audioTrackRef.current.enabled);
    }
  }, []);

  return {
    localStream,
    remoteStreams,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
  };
}