import type { Player } from '../../types/Game';

interface DayPhaseProps {
  players: Player[];
}

export const DayPhase = ({ players }: DayPhaseProps) => (
  <div className="day-phase">
    <h2>☀️ День</h2>
    <p>Обговорюйте та шукайте мафію!</p>
    <div className="alive-players">
      {players.map((p) => (
        <div key={p.id} className={`player-card ${!p.isAlive ? 'dead' : ''}`}>
          <div className="player-avatar">{p.nickname[0]}</div>
          <div className="player-name">{p.nickname}</div>
          {p.isAlive ? '✅' : '💀'}
        </div>
      ))}
    </div>
  </div>
);