import type { RoomPlayer } from '../../types';

interface Night0PhaseProps {
  myRole: string | null;
  players: RoomPlayer[];
  mafiaPlayers: RoomPlayer[];
  isMafia: boolean;
}

export function Night0Phase({ players, mafiaPlayers, isMafia }: Night0PhaseProps) {
  if (!isMafia) {
    return (
      <div className="night0-phase civilian">
        <div className="night-overlay">🌙</div>
        <h2>Ніч 0</h2>
        <p>Місто засинає... Мафія прокидається</p>
        <p className="hint">Ваші камера та мікрофон вимкнені. Чекайте на ранок.</p>
      </div>
    );
  }

  return (
    <div className="night0-phase mafia">
      <div className="night-overlay mafia">🌑</div>
      <h2>⚫ Ніч 0 — Знайомство мафії</h2>
      <p className="mafia-hint">Ви бачите своїх партнерів. Обговоріть стратегію.</p>
      
      <div className="mafia-team">
        <h3>Ваша команда:</h3>
        {mafiaPlayers.map(p => (
          <div key={p.id} className="mafia-member">
            <span className="mafia-icon">
              {p.gameRole === 'Don' ? '💍 Дон' : '👎 Мафія'}
            </span>
            <span className="mafia-name">Місце #{p.seatNumber}: {p.user?.nickname}</span>
          </div>
        ))}
      </div>

      <div className="all-players-hint">
        <h3>Всі гравці:</h3>
        <div className="players-grid">
          {players.map(p => (
            <div key={p.id} className={`player-hint ${p.gameRole === 'Don' || p.gameRole === 'Mafia' ? 'is-mafia' : ''}`}>
              #{p.seatNumber} {p.user?.nickname}
              {p.gameRole === 'Don' && ' 💍'}
              {p.gameRole === 'Mafia' && ' 👎'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}