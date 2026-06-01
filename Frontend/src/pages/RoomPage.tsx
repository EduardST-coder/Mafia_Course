import { useParams, useNavigate } from 'react-router-dom';
import { useGameHub } from '../hooks/useGameHub';
import { useState } from 'react';
import type { Player } from '../types/Game';
import { PlayerList } from '../components/game/PlayerList';
import { Chat } from '../components/game/Chat';
import { NightPhase } from '../components/game/NightPhase';
import { DayPhase } from '../components/game/DayPhase';
import { VotingPhase } from '../components/game/VotingPhase';

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    connected,
    messages,
    players,
    phase,
    myRole,
    isAlive,
    winner,
    sendMessage,
    vote,
    roleAction,
    ready,
  } = useGameHub(roomId!);

  const [messageText, setMessageText] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (!connected) return <div className="loading">Підключення до гри...</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText);
    setMessageText('');
  };

  const handleVote = (targetId: string) => {
    vote(targetId);
    setSelectedTarget(targetId);
  };

  const handleAction = (targetId: string) => {
    roleAction(myRole, targetId);
  };

  const myPlayer = players.find((p: Player) => p.isMe);
  const alivePlayers = players.filter((p: Player) => p.isAlive);

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>Кімната #{roomId}</h1>
        <div className="game-info">
          <span className="badge">Фаза: {phase}</span>
          <span className="badge">Роль: {myRole || '???'}</span>
          <span className={`badge ${isAlive ? 'alive' : 'dead'}`}>
            {isAlive ? 'Живий' : 'Мертвий'}
          </span>
        </div>
        {phase === 'waiting' && (
          <button onClick={ready} className="btn-ready">
            Готовий!
          </button>
        )}
      </div>

      <div className="game-layout">
        <div className="game-main">
          {phase === 'night' && isAlive && (
            <NightPhase
              myRole={myRole}
              players={alivePlayers}
              onAction={handleAction}
            />
          )}

          {phase === 'day' && isAlive && (
            <DayPhase players={alivePlayers} />
          )}

          {phase === 'voting' && isAlive && (
            <VotingPhase
              players={alivePlayers}
              myId={myPlayer?.id}
              selectedTarget={selectedTarget}
              onVote={handleVote}
            />
          )}

          {phase === 'ended' && (
            <div className="game-ended">
              <h2>Гру завершено!</h2>
              <p>Переможець: {winner}</p>
              <button onClick={() => navigate('/rooms')} className="btn-primary">
                Повернутися до лобі
              </button>
            </div>
          )}

          {!isAlive && phase !== 'ended' && (
            <div className="spectator-mode">
              <h2>Ви спостерігаєте 👻</h2>
              <p>Дочекайтеся завершення гри</p>
            </div>
          )}
        </div>

        <div className="game-sidebar">
          <PlayerList players={players} myId={myPlayer?.id} />
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