import type { RoomPlayer } from '../../types';

interface FoulManagerProps {
  players: RoomPlayer[];
  isHost: boolean;
  onGiveFoul: (playerId: string) => void;
}

export function FoulManager({ players, isHost, onGiveFoul }: FoulManagerProps) {
  const playersWithFouls = players.filter(p => p.fouls > 0);

  if (playersWithFouls.length === 0) return null;

  return (
    <div className="foul-manager">
      <h4>⚠️ Фоли</h4>
      <div className="foul-list-compact">
        {playersWithFouls.map(p => (
          <div key={p.id} className={`foul-badge ${p.fouls >= 4 ? 'eliminated' : p.fouls >= 3 ? 'muted' : ''}`}>
            <span>#{p.seatNumber} {p.user?.nickname}</span>
            <span className="foul-dots">{'⚠️'.repeat(p.fouls)}</span>
            {p.fouls >= 3 && <span className="status-tag">🔇 Мут</span>}
            {p.fouls >= 4 && <span className="status-tag">❌ Елімінація</span>}
            {isHost && p.fouls < 4 && (
              <button onClick={() => onGiveFoul(p.id)} className="btn-foul-small">+</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}