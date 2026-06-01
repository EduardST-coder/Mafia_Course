import type { Player } from '../../types/Game';

interface NightPhaseProps {
  myRole: string;
  players: Player[];
  onAction: (targetId: string) => void;
}

export const NightPhase = ({ myRole, players, onAction }: NightPhaseProps) => {
  if (myRole === 'civilian') {
    return (
      <div className="night-phase">
        <h2>🌙 Ніч</h2>
        <p>Ви — мирний житель. Ви спите...</p>
        <div className="sleep-animation">💤 💤 💤</div>
      </div>
    );
  }

  const actionText: Record<string, string> = {
    mafia: 'Виберіть жертву',
    don: 'Виберіть жертву',
    commissioner: 'Кого перевірити?',
    doctor: 'Кого вилікувати?',
  };

  return (
    <div className="night-phase">
      <h2>🌙 Ніч</h2>
      <p className="role-action">{actionText[myRole] || 'Дія'}</p>
      <div className="players-grid">
        {players.map((p) => (
          <button
            key={p.id}
            className="player-card"
            onClick={() => onAction(p.id)}
            disabled={p.isMe}
          >
            <div className="player-avatar">{p.nickname[0]}</div>
            <div className="player-name">{p.nickname}</div>
          </button>
        ))}
      </div>
    </div>
  );
};