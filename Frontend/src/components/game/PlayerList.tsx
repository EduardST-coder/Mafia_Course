import type { Player } from '../../types/Game';

interface PlayerListProps {
  players: Player[];
  myId: string | undefined;
}

export const PlayerList = ({ players, myId }: PlayerListProps) => (
  <div className="player-list">
    <h3>Гравці ({players.length})</h3>
    {players.map((p) => (
      <div
        key={p.id}
        className={`player-item ${p.id === myId ? 'me' : ''} ${!p.isAlive ? 'dead' : ''}`}
      >
        <span className="player-status">{p.isAlive ? '🟢' : '⚫'}</span>
        <span className="player-name">{p.nickname}</span>
        {p.isReady && <span className="ready-badge">✓</span>}
      </div>
    ))}
  </div>
);