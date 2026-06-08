import type { RoomPlayer, GamePhase } from '../../types';

interface HostPanelProps {
  phase: GamePhase;
  players: RoomPlayer[];
  currentSpeakerSeat: number | null;
  nominatedSeats: number[];
  onGiveFoul: (playerId: string) => void;
  onEliminate: (playerId: string) => void;
  onSetSpeaker: (seat: number) => void;
  onNominate: (seat: number) => void;
  onSkipSpeaker: () => void;
  onNextPhase: () => void;
  onResetVotes: () => void;
}

export function HostPanel({
  phase,
  players,
  currentSpeakerSeat,
  nominatedSeats,
  onGiveFoul,
  onEliminate,
  onSetSpeaker,
  onNominate,
  onSkipSpeaker,
  onNextPhase,
  onResetVotes,
}: HostPanelProps) {
  const alivePlayers = players.filter(p => p.status === 'Alive');

  return (
    <div className="host-panel">
      <div className="host-panel-header">
        <h3>🎤 Панель ведучого</h3>
        <div className="host-actions">
          <button onClick={onNextPhase} className="btn-host">⏭️ Наступна фаза</button>
          <button onClick={onResetVotes} className="btn-host secondary">🔄 Скинути голоси</button>
        </div>
      </div>

      {phase === 'Day' && (
        <div className="host-section">
          <h4>Управління колом:</h4>
          <div className="speaker-controls">
            <span>Поточний: #{currentSpeakerSeat ?? '—'}</span>
            <button onClick={onSkipSpeaker} className="btn-host">⏭️ Наступний спікер</button>
          </div>
          <div className="seat-buttons">
            {alivePlayers.map(p => (
              <button
                key={p.id}
                onClick={() => onSetSpeaker(p.seatNumber)}
                className={`seat-btn ${currentSpeakerSeat === p.seatNumber ? 'active' : ''}`}
              >
                #{p.seatNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="host-section">
        <h4>Номінації:</h4>
        <div className="nomination-controls">
          {alivePlayers.map(p => (
            <button
              key={p.id}
              onClick={() => onNominate(p.seatNumber)}
              className={`seat-btn ${nominatedSeats.includes(p.seatNumber) ? 'nominated' : ''}`}
              disabled={nominatedSeats.includes(p.seatNumber)}
            >
              #{p.seatNumber} {nominatedSeats.includes(p.seatNumber) && '✓'}
            </button>
          ))}
        </div>
      </div>

      <div className="host-section">
        <h4>Фоли та елімінація:</h4>
        <div className="foul-list">
          {players.map(p => (
            <div key={p.id} className={`foul-item ${p.fouls >= 3 ? 'warning' : ''} ${p.fouls >= 4 ? 'danger' : ''}`}>
              <span>#{p.seatNumber} {p.user?.nickname}</span>
              <span className="foul-count">{'⚠️'.repeat(p.fouls)}</span>
              <div className="foul-actions">
                <button onClick={() => onGiveFoul(p.id)} className="btn-foul">+ Фол</button>
                <button onClick={() => onEliminate(p.id)} className="btn-eliminate">❌ Елімінація</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}