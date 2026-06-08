import type { RoomPlayer } from '../../types';

interface PlayerListProps {
  players: RoomPlayer[];
  myId: string | undefined;
}

export const PlayerList = ({ players, myId }: PlayerListProps) => (
  <div className="player-list">
    <h3>Гравці ({players.length})</h3>
    {players.map((p) => (
      <div
        key={p.id}
        className={`player-item ${p.userId === myId ? 'me' : ''} ${p.status !== 'Alive' ? 'dead' : ''}`}
      >
        <span className="player-status">{p.status === 'Alive' ? '🟢' : '⚫'}</span>
        <span className="player-name">{p.user.nickname}</span>
        {p.isReady && <span className="ready-badge">✓</span>}
      </div>
    ))}
  </div>
);