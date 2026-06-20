import type {
  RoomPlayer,
  GamePhase,
  GameRole,
} from '../../types';

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

  onChangePhase: (
    phase: GamePhase
  ) => void;

  onChangeRole: (
    playerId: string,
    role: GameRole
  ) => void;

  onToggleAlive: (
    playerId: string
  ) => void;
}

const roles: GameRole[] = [
  'Civilian',
  'Sheriff',
  'Mafia',
  'Don',
];

const phases: GamePhase[] = [
  'Waiting',
  'Night0',
  'Night',
  'Day',
  'Voting',
  'Revote',
  'BestMove',
  'Farewell',
  'Ended',
];

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

  onChangePhase,
  onChangeRole,
  onToggleAlive,
}: HostPanelProps) {
  const alivePlayers = players.filter(
    p => p.status === 'Alive'
  );

  return (
    <div className="host-panel">
      <div className="host-panel-header">
        <h3>🎤 Панель ведучого</h3>

        <div className="host-actions">
          <button
            onClick={onNextPhase}
            className="btn-host"
          >
            ⏭️ Наступна фаза
          </button>

          <button
            onClick={onResetVotes}
            className="btn-host secondary"
          >
            🔄 Скинути голоси
          </button>
        </div>
      </div>

      <div className="host-section">
        <h4>🎮 Фаза гри</h4>

        <div className="phase-buttons">
          {phases.map(gamePhase => (
            <button
              key={gamePhase}
              onClick={() =>
                onChangePhase(gamePhase)
              }
              className={`btn-host ${
                phase === gamePhase
                  ? 'active'
                  : ''
              }`}
            >
              {gamePhase}
            </button>
          ))}
        </div>
      </div>

      <div className="host-section">
        <h4>🎭 Ролі та статуси</h4>

        {players.map(player => (
          <div
            key={player.id}
            className="role-row"
          >
            <span>
              #{player.seatNumber}{' '}
              {player.user?.nickname ?? 'Unknown'}
            </span>

            <select
              value={
                player.gameRole ??
                'Civilian'
              }
              onChange={e =>
                onChangeRole(
                  player.id,
                  e.target
                    .value as GameRole
                )
              }
            >
              {roles.map(role => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                onToggleAlive(
                  player.id
                )
              }
              className={`btn-host ${
                player.status ===
                'Alive'
                  ? ''
                  : 'danger'
              }`}
            >
              {player.status ===
              'Alive'
                ? '🟢 Alive'
                : '⚫ Dead'}
            </button>
          </div>
        ))}
      </div>

      {phase === 'Day' && (
        <div className="host-section">
          <h4>Управління колом</h4>

          <div className="speaker-controls">
            <span>
              Поточний: #
              {currentSpeakerSeat ??
                '—'}
            </span>

            <button
              onClick={
                onSkipSpeaker
              }
              className="btn-host"
            >
              ⏭️ Наступний спікер
            </button>
          </div>

          <div className="seat-buttons">
            {alivePlayers.map(p => (
              <button
                key={p.id}
                onClick={() =>
                  onSetSpeaker(
                    p.seatNumber ?? 0
                  )
                }
                className={`seat-btn ${
                  currentSpeakerSeat ===
                  p.seatNumber
                    ? 'active'
                    : ''
                }`}
              >
                #{p.seatNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="host-section">
        <h4>Номінації</h4>

        <div className="nomination-controls">
          {alivePlayers.map(p => (
            <button
              key={p.id}
              onClick={() =>
                onNominate(
                  p.seatNumber ?? 0
                )
              }
              className={`seat-btn ${
                nominatedSeats.includes(
                  p.seatNumber ?? 0
                )
                  ? 'nominated'
                  : ''
              }`}
            >
              #{p.seatNumber}
            </button>
          ))}
        </div>
      </div>

      <div className="host-section">
        <h4>
          ⚠️ Фоли та елімінація
        </h4>

        <div className="foul-list">
          {players.map(p => (
            <div
              key={p.id}
              className={`foul-item ${
                p.fouls >= 3
                  ? 'warning'
                  : ''
              } ${
                p.fouls >= 4
                  ? 'danger'
                  : ''
              }`}
            >
              <span>
                #{p.seatNumber}{' '}
                {p.user?.nickname ?? 'Unknown'}
              </span>

              <span className="foul-count">
                {'⚠️'.repeat(p.fouls)}
              </span>

              <div className="foul-actions">
                <button
                  onClick={() =>
                    onGiveFoul(
                      p.id
                    )
                  }
                  className="btn-foul"
                >
                  + Фол
                </button>

                <button
                  onClick={() =>
                    onEliminate(
                      p.id
                    )
                  }
                  className="btn-eliminate"
                >
                  ❌ Елімінація
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}