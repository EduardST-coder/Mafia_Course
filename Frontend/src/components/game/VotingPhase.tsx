import { useState } from 'react';
import type { Player } from '../../types/Game';

interface VotingPhaseProps {
  players: Player[];
  myId: string | undefined;
  selectedTarget: string | null;
  onVote: (targetId: string) => void;
}

export const VotingPhase = ({ players, myId, selectedTarget, onVote }: VotingPhaseProps) => {
  const [voted, setVoted] = useState(false);

  const handleVote = (targetId: string) => {
    onVote(targetId);
    setVoted(true);
  };

  if (voted) {
    return (
      <div className="voting-phase">
        <h2>🗳️ Голосування</h2>
        <p>Ви проголосували. Очікуйте результатів...</p>
      </div>
    );
  }

  return (
    <div className="voting-phase">
      <h2>🗳️ Голосування</h2>
      <p>Кого виганяємо з міста?</p>
      <div className="players-grid">
        {players.map((p) => (
          <button
            key={p.id}
            className={`player-card ${selectedTarget === p.id ? 'selected' : ''}`}
            onClick={() => handleVote(p.id)}
            disabled={p.id === myId}
          >
            <div className="player-avatar">{p.nickname[0]}</div>
            <div className="player-name">{p.nickname}</div>
            <div className="vote-count">{p.votes || 0} голосів</div>
          </button>
        ))}
      </div>
    </div>
  );
};