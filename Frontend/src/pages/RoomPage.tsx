import { useParams, useNavigate } from 'react-router-dom';
import { useGameHub } from '../hooks/useGameHub';
import { useState, useContext, useEffect } from 'react';
import type { GamePhase } from '../types';
import { AuthContext } from '../context/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { PlayerList } from '../components/game/PlayerList';
import { Chat } from '../components/game/Chat';
import { NightPhase } from '../components/game/NightPhase';
import { DayPhase } from '../components/game/DayPhase';
import { VotingPhase } from '../components/game/VotingPhase';
import { Night0Phase } from '../components/game/Night0Phase';
import { HostPanel } from '../components/game/HostPanel';
import { Timer } from '../components/game/Timer';
import { RoleReveal } from '../components/game/RoleReveal';
import { FoulManager } from '../components/game/FoulManager';
import { SpeakerIndicator } from '../components/game/SpeakerIndicator';
import { joinRoom } from '../services/roomService';

const PHASE_DISPLAY: Record<GamePhase, string> = {
  Waiting: 'Очікування',
  Night0: 'Ніч 0 — Знайомство мафії',
  Night: 'Ніч',
  Day: 'День — Коло',
  Voting: 'Голосування',
  Revote: 'Переголосування',
  BestMove: 'Best Move',
  Farewell: 'Прощальне слово',
  Ended: 'Гру завершено',
};

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token') || '';
  
  const {
    connected,
    messages,
    players,
    phase,
    myRole,
    isAlive,
    winner,
    timeRemaining,
    currentSpeakerSeat,
    round,
    nominatedSeats,
    revoteNominatedSeats,
    lastKilledSeat,
    mafiaKillResult,
    sheriffCheckResult,
    donCheckResult,
    myPlayer,
    isHost,
    mafiaPlayers,
    isMafia,
    isSheriff,
    isDon,
    sendMessage,
    vote,
    revote,
    roleAction,
    endSpeech,
    startGame,
    nextPhase,
    giveFoul,
    eliminatePlayer,
    setSpeaker,
    nominatePlayer,
    skipSpeaker,
    resetVotes,
  } = useGameHub({ roomId: roomId || '' });

  const [messageText, setMessageText] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [showRoleReveal, setShowRoleReveal] = useState(false);

  const webrtc = useWebRTC({
  roomId: roomId || '',
  token,
  userId: user?.id || null,
  isHost,
});
  const { isCameraOn, isMicOn, toggleCamera, toggleMic } = webrtc;
  useEffect(() => {
  const joinCurrentRoom = async () => {
    if (!roomId) return;

    try {
      const result = await joinRoom(roomId);
      console.log("JOIN ROOM SUCCESS:", result);
    } catch (error) {
      console.error("JOIN ROOM ERROR:", error);
    }
  };

  joinCurrentRoom();
}, [roomId]);

  const isMyTurn = currentSpeakerSeat === myPlayer?.seatNumber;

  useEffect(() => {
    if (!phase || !myPlayer) return;
    if (!isAlive && phase !== 'Ended') return;

    switch (phase) {
      case 'Night0':
        if (isMafia || isHost) {
          if (!isCameraOn) toggleCamera();
          if (!isMicOn) toggleMic();
        } else {
          if (isCameraOn) toggleCamera();
          if (isMicOn) toggleMic();
        }
        break;
      
      case 'Night':
        if (isMafia) {
          if (!isCameraOn) toggleCamera();
          if (!isMicOn) toggleMic();
        } else {
          if (isCameraOn) toggleCamera();
          if (isMicOn) toggleMic();
        }
        break;
      
      case 'Day':
        if (!isCameraOn) toggleCamera();
        if (isMyTurn) {
          if (!isMicOn) toggleMic();
        } else {
          if (isMicOn) toggleMic();
        }
        break;
      
      case 'Voting':
      case 'Revote':
        if (!isCameraOn) toggleCamera();
        if (isMicOn) toggleMic();
        break;
      
      case 'Ended':
        if (!isCameraOn) toggleCamera();
        if (!isMicOn) toggleMic();
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isMafia, isHost, isMyTurn, myPlayer, isAlive]);

  useEffect(() => {
    if (phase === 'Night0' && myRole) {
      setShowRoleReveal(true);
      const timer = setTimeout(() => setShowRoleReveal(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [phase, myRole]);

  if (!connected) return <div className="loading">Підключення до гри...</div>;
  if (!myPlayer) return <div className="loading">Завантаження гравця...</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText);
    setMessageText('');
  };

  const handleVote = (targetSeat: number) => {
    if (phase === 'Revote') {
      revote(targetSeat);
    } else {
      vote(targetSeat);
    }
    setSelectedTarget(targetSeat);
  };

  const handleAction = (targetSeat: number) => {
    if (myRole) {
      roleAction(myRole, targetSeat);
    }
  };

  const handleEndSpeech = () => {
    endSpeech();
  };

  const handleGiveFoul = (playerId: string) => giveFoul(Number(playerId));
  const handleEliminate = (playerId: string) => eliminatePlayer(Number(playerId));

  return (
    <div className="game-page">
      {showRoleReveal && <RoleReveal role={myRole} onClose={() => setShowRoleReveal(false)} />}

      <div className="game-header">
        <div className="header-left">
          <h1>Кімната #{roomId?.slice(0, 8)}</h1>
          <div className="game-meta">
            <span className="badge phase">Фаза: {PHASE_DISPLAY[phase] || phase}</span>
            <span className="badge round">Раунд: {round}</span>
            {myRole && (
              <span className={`badge role ${getRoleColorClass(myRole)}`}>
                {getRoleIcon(myRole)} {getRoleDisplayName(myRole)}
              </span>
            )}
            <span className={`badge status ${isAlive ? 'alive' : 'dead'}`}>
              {isAlive ? '☀️ Живий' : '💀 Мертвий'}
            </span>
          </div>
        </div>

        <div className="header-center">
          <Timer timeRemaining={timeRemaining} />
          {phase === 'Day' && currentSpeakerSeat !== null && (
            <SpeakerIndicator 
              seat={currentSpeakerSeat} 
              player={players.find(p => p.seatNumber === currentSpeakerSeat)} 
              isMyTurn={isMyTurn}
            />
          )}
        </div>

        <div className="header-right">
          {isHost && phase === 'Waiting' && (
            <button onClick={startGame} className="btn-start">
              🚀 Почати гру
            </button>
          )}
          {isHost && phase !== 'Waiting' && phase !== 'Ended' && (
            <button onClick={nextPhase} className="btn-next">
              ⏭️ Наступна фаза
            </button>
          )}
          <button onClick={() => navigate('/rooms')} className="btn-leave">
            ← Вийти
          </button>
        </div>
      </div>

      <div className="webrtc-controls">
        <button 
          className={`cam-btn ${isCameraOn ? 'on' : 'off'}`}
          onClick={toggleCamera}
        >
          {isCameraOn ? '📹' : '📹❌'} Камера
        </button>
        <button 
          className={`mic-btn ${isMicOn ? 'on' : 'off'}`}
          onClick={toggleMic}
        >
          {isMicOn ? '🎤' : '🎤❌'} Мікрофон
        </button>
      </div>

      {isHost && phase !== 'Ended' && (
  <HostPanel
  phase={phase}
  players={players}
  currentSpeakerSeat={currentSpeakerSeat}
  nominatedSeats={nominatedSeats}
  onGiveFoul={handleGiveFoul}
  onEliminate={handleEliminate}
  onSetSpeaker={setSpeaker}
  onNominate={nominatePlayer}
  onSkipSpeaker={skipSpeaker}
  onNextPhase={nextPhase}
  onResetVotes={resetVotes}

  onChangePhase={(phase) => {
    console.log('Change phase:', phase);
  }}

  onChangeRole={(playerId, role) => {
    console.log(
      'Change role:',
      playerId,
      role
    );
  }}

  onToggleAlive={(playerId) => {
    console.log(
      'Toggle alive:',
      playerId
    );
  }}
/>
)}

      <FoulManager players={players} isHost={isHost} onGiveFoul={handleGiveFoul} />

      <div className="game-layout">
        <div className="game-main">
          {phase === 'Night0' && (
            <Night0Phase
              myRole={myRole}
              players={players}
              mafiaPlayers={mafiaPlayers}
              isMafia={isMafia}
            />
          )}

          {phase === 'Night' && isAlive && (
            <NightPhase
              myRole={myRole}
              players={players.filter(p => p.status === 'Alive')}
              mafiaPlayers={mafiaPlayers}
              isMafia={isMafia}
              isSheriff={isSheriff}
              isDon={isDon}
              mafiaKillResult={mafiaKillResult}
              sheriffCheckResult={sheriffCheckResult}
              donCheckResult={donCheckResult}
              onAction={handleAction}
            />
          )}

          {phase === 'Day' && (
            <DayPhase
              players={players}
              currentSpeakerSeat={currentSpeakerSeat}
              mySeat={myPlayer.seatNumber}
              isAlive={isAlive}
              onEndSpeech={handleEndSpeech}
              isMyTurn={isMyTurn}
            />
          )}

          {(phase === 'Voting' || phase === 'Revote') && isAlive && (
            <VotingPhase
              players={players.filter(p => p.status === 'Alive')}
              mySeat={myPlayer.seatNumber}
              nominatedSeats={phase === 'Revote' ? revoteNominatedSeats : nominatedSeats}
              selectedTarget={selectedTarget}
              onVote={handleVote}
              hasVoted={myPlayer.hasVoted}
              isRevote={phase === 'Revote'}
            />
          )}

          {phase === 'BestMove' && isHost && (
            <div className="best-move-panel">
              <h3>🎯 Best Move</h3>
              <p>Виберіть підозрюваних для перевірки:</p>
            </div>
          )}

          {phase === 'Farewell' && lastKilledSeat && (
            <div className="farewell-phase">
              <h2>💀 Останнє слово</h2>
              <p>Гравець на місці #{lastKilledSeat} — остання промова</p>
            </div>
          )}

          {phase === 'Ended' && (
            <div className="game-ended">
              <h2>🏆 Гру завершено!</h2>
              <p className="winner-text">Переможець: {winner === 'Mafia' ? '⚫ Мафія' : '🔴 Мирні'}</p>
              <div className="final-roles">
                {players.map(p => (
                  <div key={p.id} className={`final-role ${getRoleColorClass(p.gameRole)}`}>
                    Місце #{p.seatNumber}: {p.user?.nickname} — {getRoleDisplayName(p.gameRole)}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/rooms')} className="btn-primary">
                Повернутися до лобі
              </button>
            </div>
          )}

          {!isAlive && phase !== 'Ended' && (
            <div className="spectator-mode">
              <h2>👻 Ви спостерігаєте</h2>
              <p>Дочекайтеся завершення гри</p>
              <div className="spectator-hint">
                💡 Мертві гравці можуть писати в мертвий чат
              </div>
            </div>
          )}
        </div>

        <div className="game-sidebar">
          <PlayerList 
            players={players} 
            myId={myPlayer.id}
          />
          <Chat
            messages={messages}
            onSend={handleSend}
            text={messageText}
            setText={setMessageText}
          />
        </div>
      </div>
    </div>
  );
}

function getRoleColorClass(role: string | undefined): string {
  switch (role) {
    case 'Civilian': return 'role-civilian';
    case 'Sheriff': return 'role-sheriff';
    case 'Mafia': return 'role-mafia';
    case 'Don': return 'role-don';
    default: return '';
  }
}

function getRoleIcon(role: string | undefined): string {
  switch (role) {
    case 'Civilian': return '👍';
    case 'Sheriff': return '🛡️';
    case 'Mafia': return '👎';
    case 'Don': return '💍';
    default: return '❓';
  }
}

function getRoleDisplayName(role: string | undefined): string {
  switch (role) {
    case 'Civilian': return 'Мирний';
    case 'Sheriff': return 'Шериф';
    case 'Mafia': return 'Мафія';
    case 'Don': return 'Дон';
    default: return 'Невідомо';
  }
}