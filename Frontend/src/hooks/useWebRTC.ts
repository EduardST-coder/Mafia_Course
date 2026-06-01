import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

interface PeerConnection {
  connectionId: string;
  pc: RTCPeerConnection;
  stream?: MediaStream;
}

// ICE сервери (STUN для публічних IP) — константа за межами компонента
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC(roomId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  // Ініціалізація локального відео/аудіо
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch (err) {
      console.error('Помилка доступу до камери/мікрофона:', err);
      alert('Не вдалося отримати доступ до камери або мікрофона');
    }
  }, []);

  // Створення RTCPeerConnection для нового користувача
  const createPeerConnection = useCallback((connectionId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Додаємо локальні треки
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Обробка віддаленого потоку
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(connectionId, stream);
        return newMap;
      });
    };

    // ICE кандидати
    pc.onicecandidate = (event) => {
      if (event.candidate && connectionRef.current) {
        connectionRef.current.invoke('SendIceCandidate', roomId, connectionId, JSON.stringify(event.candidate));
      }
    };

    peersRef.current.set(connectionId, { connectionId, pc });
    return pc;
  }, [roomId]);

  // Підключення до SignalR WebRTC хаба
  useEffect(() => {
    if (!roomId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/webrtc', {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Новий користувач приєднався
    connection.on('UserJoined', async (connectionId: string) => {
      console.log('Користувач приєднався:', connectionId);
      const pc = createPeerConnection(connectionId);
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await connection.invoke('SendOffer', roomId, connectionId, JSON.stringify(offer));
    });

    // Отримали Offer
    connection.on('ReceiveOffer', async (fromConnectionId: string, sdp: string) => {
      console.log('Отримано Offer від:', fromConnectionId);
      const pc = createPeerConnection(fromConnectionId);
      
      await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sdp)));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await connection.invoke('SendAnswer', roomId, fromConnectionId, JSON.stringify(answer));
    });

    // Отримали Answer
    connection.on('ReceiveAnswer', async (fromConnectionId: string, sdp: string) => {
      console.log('Отримано Answer від:', fromConnectionId);
      const peer = peersRef.current.get(fromConnectionId);
      if (peer) {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sdp)));
      }
    });

    // Отримали ICE кандидата
    connection.on('ReceiveIceCandidate', async (fromConnectionId: string, candidate: string) => {
      const peer = peersRef.current.get(fromConnectionId);
      if (peer) {
        await peer.pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
      }
    });

    // Користувач вийшов
    connection.on('UserLeft', (connectionId: string) => {
      console.log('Користувач вийшов:', connectionId);
      const peer = peersRef.current.get(connectionId);
      if (peer) {
        peer.pc.close();
        peersRef.current.delete(connectionId);
      }
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(connectionId);
        return newMap;
      });
    });

    // Старт
    const startConnection = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        await connection.invoke('JoinCall', roomId);
      } catch (err) {
        console.error('Помилка підключення до WebRTC хаба:', err);
      }
    };

    startConnection();

    return () => {
      const peers = peersRef.current;
      connection.stop();
      peers.forEach(peer => peer.pc.close());
      peers.clear();
      setRemoteStreams(new Map());
    };
  }, [roomId, createPeerConnection]);

  // Ініціалізація локального потоку при першому рендері
  useEffect(() => {
    initLocalStream();
  }, [initLocalStream]);

  // Вмикання/вимикання камери
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, []);

  // Вмикання/вимикання мікрофона
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  }, []);

  return {
    localStream,
    remoteStreams,
    isCameraOn,
    isMicOn,
    isConnected,
    toggleCamera,
    toggleMic,
  };
}