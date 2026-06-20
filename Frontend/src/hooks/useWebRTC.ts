// Frontend/src/hooks/useWebRTC.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { webrtcSignalRService } from '../services/webrtcSignalRService';

interface UseWebRTCProps {
  roomId: string;
  token: string;
  userId: string | null;
  isHost: boolean;
}

interface ExistingUser {
  connectionId: string;
  userId: string;
}

export function useWebRTC({
  roomId,
  token,
  userId,
  isHost,
}: UseWebRTCProps){
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
const audioTrackRef = useRef<MediaStreamTrack | null>(null);

const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

const connectionIdToUserId = useRef<Map<string, string>>(new Map());

const userIdToConnectionId = useRef<Map<string, string>>(new Map());

const pendingIceCandidates = useRef<
  Map<string, RTCIceCandidateInit[]>
>(new Map());

const initializedRef = useRef(false);

const localStreamRef = useRef<MediaStream | null>(null);

const isActiveRef = useRef(true);

  // 1. Ініціалізація локального стріму
  const initLocalStream = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isHost
        ? false
        : {
            width: 640,
            height: 480,
            facingMode: 'user',
          },

      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    videoTrackRef.current =
      stream.getVideoTracks()[0] ?? null;

    audioTrackRef.current =
      stream.getAudioTracks()[0] ?? null;

    localStreamRef.current = stream;
    setLocalStream(stream);

    if (isHost) {
      setIsCameraOn(false);
    }
  } catch (err) {
    console.error(
      'Failed to get local stream:',
      err
    );

    const emptyStream = new MediaStream();

    localStreamRef.current = emptyStream;
    setLocalStream(emptyStream);
  }
}, [isHost]);

  useEffect(() => {
    initLocalStream();
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    };
  }, [initLocalStream]);

  // 2. Створення RTCPeerConnection
  const createPeerConnection = useCallback((targetUserId: string) => {
    if (peerConnections.current.has(targetUserId)) {
      return peerConnections.current.get(targetUserId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Додаємо локальні треки
    const currentStream = localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, currentStream);
        } catch (e) {
          console.warn('Failed to add track:', e);
        }
      });
    }

    // Отримуємо віддалений стрім
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream && isActiveRef.current) {
        console.log('🎥 Received remote stream from:', targetUserId);
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.set(targetUserId, remoteStream);
          return next;
        });
      }
    };

    // ICE кандидати → SignalR
    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        const targetConnId = userIdToConnectionId.current.get(targetUserId);
        if (targetConnId) {
          webrtcSignalRService.sendIceCandidate(
            roomId,
            targetConnId,
            JSON.stringify(event.candidate.toJSON())
          );
        }
      }
    };

    // Моніторинг стану
    pc.onconnectionstatechange = () => {
      console.log(`📡 Connection [${targetUserId}]:`, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.delete(targetUserId);
          return next;
        });
      }
    };

    peerConnections.current.set(targetUserId, pc);
    return pc;
  }, [roomId]);

  // 3. Видалення peer connection
  const removePeerConnection = useCallback((targetUserId: string) => {
    const pc = peerConnections.current.get(targetUserId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(targetUserId);
    }
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(targetUserId);
      return next;
    });
    const connId = userIdToConnectionId.current.get(targetUserId);
    if (connId) {
      connectionIdToUserId.current.delete(connId);
      userIdToConnectionId.current.delete(targetUserId);
    }
  }, []);

  // 4. Cleanup функція
  const cleanup = useCallback(() => {
    isActiveRef.current = false;
    peerConnections.current.forEach((pc, uid) => {
      pc.close();
      console.log('🔌 Closed peer connection:', uid);
    });
    peerConnections.current.clear();
    connectionIdToUserId.current.clear();
    userIdToConnectionId.current.clear();
    setRemoteStreams(new Map());
    void webrtcSignalRService.disconnect();
  }, []);

  // 5. Підключення до SignalR та WebRTC handshake
  useEffect(() => {
    if (initializedRef.current || !roomId || !token || !userId) return;
    initializedRef.current = true;
    isActiveRef.current = true;

    const connect = async () => {
      try {
        await webrtcSignalRService.connect(token);

        // ✅ ExistingUsers: масив об'єктів { connectionId, userId }
webrtcSignalRService.on('ExistingUsers', (...args: unknown[]) => {
  if (!isActiveRef.current) return;

  const [usersData] = args;
  const users = (usersData as ExistingUser[]) || [];

  console.log('👥 ExistingUsers:', users);

  users.forEach(({ connectionId, userId: uid }) => {
    if (uid !== userId && uid) {
      connectionIdToUserId.current.set(
        connectionId,
        uid
      );

      userIdToConnectionId.current.set(
        uid,
        connectionId
      );

      console.log(
        '👤 Registered existing user:',
        uid
      );

      // ✅ Не створюємо другий PeerConnection
      if (peerConnections.current.has(uid)) {
        console.log(
          '⚠️ Peer already exists, skipping:',
          uid
        );
        return;
      }

      const pc = createPeerConnection(uid);

      pc.createOffer()
        .then(offer =>
          pc.setLocalDescription(offer)
        )
        .then(() => {
          if (pc.localDescription) {
            return webrtcSignalRService.sendOffer(
              roomId,
              connectionId,
              JSON.stringify(
                pc.localDescription.toJSON()
              )
            );
          }
        })
        .catch(err =>
          console.error(
            '❌ Existing user offer failed:',
            err
          )
        );
    }
  });
});

        // ✅ UserJoined: (connectionId, userId)
        webrtcSignalRService.on('UserJoined', (...args: unknown[]) => {
  if (!isActiveRef.current) return;

  const [joinedConnectionId, joinedUserId] =
    args as [string, string];

  console.log(
    '👋 UserJoined:',
    joinedUserId,
    'conn:',
    joinedConnectionId
  );

  if (joinedUserId === userId) {
    return;
  }

  connectionIdToUserId.current.set(
    joinedConnectionId,
    joinedUserId
  );

  userIdToConnectionId.current.set(
    joinedUserId,
    joinedConnectionId
  );

  // ✅ Не створюємо другий Offer
  if (
    peerConnections.current.has(
      joinedUserId
    )
  ) {
    console.log(
      '⚠️ Peer already exists, skipping offer:',
      joinedUserId
    );
    return;
  }

  const pc =
    createPeerConnection(
      joinedUserId
    );

  pc.createOffer()
    .then(offer =>
      pc.setLocalDescription(
        offer
      )
    )
    .then(() => {
      if (pc.localDescription) {
        return webrtcSignalRService.sendOffer(
          roomId,
          joinedConnectionId,
          JSON.stringify(
            pc.localDescription.toJSON()
          )
        );
      }
    })
    .catch(err =>
      console.error(
        '❌ Offer failed:',
        err
      )
    );
});

        // ✅ UserLeft: (connectionId, userId)
        webrtcSignalRService.on('UserLeft', (...args: unknown[]) => {
          if (!isActiveRef.current) return;
          
          const [, leftUserId] = args as [string, string];
          console.log('👋 UserLeft:', leftUserId);
          
          if (leftUserId) {
            removePeerConnection(leftUserId);
          }
        });

        // ✅ ReceiveOffer: (connectionId, fromUserId, sdp)
        webrtcSignalRService.on('ReceiveOffer', (...args: unknown[]) => {
  if (!isActiveRef.current) return;

  const [, fromUserId, sdp] =
    args as [string, string, string];

  console.log(
    '📨 ReceiveOffer from:',
    fromUserId
  );

  try {
    const offer: RTCSessionDescriptionInit =
      JSON.parse(sdp);

    const pc =
      createPeerConnection(
        fromUserId
      );

    // ✅ Захист від повторного offer
    if (
      pc.signalingState !==
      'stable'
    ) {
      console.log(
        '⚠️ Ignoring offer in state:',
        pc.signalingState,
        'from:',
        fromUserId
      );
      return;
    }

    pc.setRemoteDescription(
      new RTCSessionDescription(
        offer
      )
    )
      .then(() =>
        pc.createAnswer()
      )
      .then(answer =>
        pc.setLocalDescription(
          answer
        )
      )
      .then(() => {
        if (pc.localDescription) {
          const targetConnId =
            userIdToConnectionId.current.get(
              fromUserId
            ) || '';

          if (targetConnId) {
            return webrtcSignalRService.sendAnswer(
              roomId,
              targetConnId,
              JSON.stringify(
                pc.localDescription.toJSON()
              )
            );
          }
        }
      })
      .then(() => {
        console.log(
          '✅ Answer sent to:',
          fromUserId
        );
      })
      .catch(err =>
        console.error(
          '❌ Answer failed:',
          err
        )
      );
  } catch (e) {
    console.error(
      '❌ Parse offer failed:',
      e
    );
  }
});
        // ✅ ReceiveAnswer: (connectionId, fromUserId, sdp)
        webrtcSignalRService.on('ReceiveAnswer', (...args: unknown[]) => {
  if (!isActiveRef.current) return;

  const [, fromUserId, sdp] =
    args as [string, string, string];

  console.log(
    '📨 ReceiveAnswer from:',
    fromUserId
  );

  const pc =
    peerConnections.current.get(
      fromUserId
    );

  if (!pc) {
    console.warn(
      '⚠️ No peer connection for:',
      fromUserId
    );
    return;
  }

  try {
    const answer: RTCSessionDescriptionInit =
      JSON.parse(sdp);

    // ✅ Answer можна застосовувати
    // тільки якщо ми раніше створили Offer
    if (
      pc.signalingState !==
      'have-local-offer'
    ) {
      console.log(
        '⚠️ Ignoring answer in state:',
        pc.signalingState,
        'from:',
        fromUserId
      );
      return;
    }

    pc.setRemoteDescription(
      new RTCSessionDescription(
        answer
      )
    )
      .then(() => {
        console.log(
          '✅ Remote answer applied:',
          fromUserId
        );
      })
      .catch(err =>
        console.error(
          '❌ Set remote desc failed:',
          err
        )
      );
  } catch (e) {
    console.error(
      '❌ Parse answer failed:',
      e
    );
  }
});

        // ✅ ReceiveIceCandidate: (connectionId, fromUserId, candidate)
        webrtcSignalRService.on('ReceiveIceCandidate', (...args: unknown[]) => {
  if (!isActiveRef.current) return;

  const [, fromUserId, candidate] =
    args as [string, string, string];

  console.log(
    '❄️ ReceiveIceCandidate from:',
    fromUserId
  );

  const pc =
    peerConnections.current.get(
      fromUserId
    );

  if (!pc) {
    console.warn(
      '⚠️ No peer connection for ICE:',
      fromUserId
    );
    return;
  }

  try {
    const iceCandidate: RTCIceCandidateInit =
      JSON.parse(candidate);

    // ✅ RemoteDescription ще немає
    if (!pc.remoteDescription) {
      console.log(
        '⏳ Queueing ICE candidate:',
        fromUserId
      );

      const pending =
        pendingIceCandidates.current.get(
          fromUserId
        ) || [];

      pending.push(iceCandidate);

      pendingIceCandidates.current.set(
        fromUserId,
        pending
      );

      return;
    }

    pc.addIceCandidate(
      new RTCIceCandidate(
        iceCandidate
      )
    )
      .then(() => {
        console.log(
          '✅ ICE candidate added:',
          fromUserId
        );
      })
      .catch(err =>
        console.error(
          '❌ Add ICE failed:',
          err
        )
      );
  } catch (e) {
    console.error(
      '❌ Parse ICE failed:',
      e
    );
  }
});

        await webrtcSignalRService.joinCall(roomId, userId);
        console.log('✅ Joined WebRTC room:', roomId);
      } catch (err) {
        console.error('❌ WebRTC connection error:', err);
      }
    };

    void connect();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, token, userId]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (!videoTrackRef.current) return;
    videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
    setIsCameraOn(videoTrackRef.current.enabled);

    peerConnections.current.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender && videoTrackRef.current) {
        sender.replaceTrack(videoTrackRef.current.enabled ? videoTrackRef.current : null)
          .catch(console.error);
      }
    });
  }, []);

  // Toggle mic
  const toggleMic = useCallback(() => {
    if (!audioTrackRef.current) return;
    audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
    setIsMicOn(audioTrackRef.current.enabled);

    peerConnections.current.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
      if (sender && audioTrackRef.current) {
        sender.replaceTrack(audioTrackRef.current.enabled ? audioTrackRef.current : null)
          .catch(console.error);
      }
    });
  }, []);

  // Отримати стрім для конкретного userId
  const getStreamForUser = useCallback((targetUserId: string): MediaStream | null => {
    if (targetUserId === userId) {
      return localStreamRef.current;
    }
    return remoteStreams.get(targetUserId) || null;
  }, [remoteStreams, userId]);

  return {
    localStream,
    remoteStreams,
    getStreamForUser,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
  };
}