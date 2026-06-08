import type { RoomPlayer } from '../../types';

interface VotingPhaseProps {
  players: RoomPlayer[];
  mySeat: number;
  nominatedSeats: number[];
  selectedTarget: number | null;
  onVote: (targetSeat: number) => void;
  hasVoted: boolean;
  isRevote: boolean;
}

export function VotingPhase({ 
  players, 
  mySeat, 
  nominatedSeats, 
  selectedTarget, 
  onVote, 
  hasVoted,
  isRevote 
}: VotingPhaseProps) {
  if (nominatedSeats.length === 0) {
    return (
      <div className="voting-phase">
        <h2>🗳️ {isRevote ? 'Переголосування' : 'Голосування'}</h2>
        <p>Номінацій немає. Перехід до наступної фази...</p>
      </div>
    );
  }

  return (
    <div className="voting-phase">
      <h2>🗳️ {isRevote ? 'Переголосування' : 'Голосування'}</h2>
      <p className="voting-hint">
        {isRevote 
          ? 'Голосуємо тільки за номінованих на переголосування' 
          : 'Виберіть гравця, проти якого голосуєте'}
      </p>

      <div className="nominated-list">
        {nominatedSeats.map(seat => {
          const player = players.find(p => p.seatNumber === seat);
          if (!player) return null;
          const isSelected = selectedTarget === seat;
          const isMe = seat === mySeat;

          return (
            <button
              key={seat}
              className={`vote-card ${isSelected ? 'selected' : ''} ${isMe ? 'me' : ''}`}
              onClick={() => !hasVoted && onVote(seat)}
              disabled={hasVoted || isMe}
            >
              <div className="vote-seat">#{seat}</div>
              <div className="vote-name">{player.user?.nickname}</div>
              {isSelected && <div className="vote-check">✓</div>}
              {hasVoted && isSelected && <div className="voted-badge">Ви проголосували</div>}
            </button>
          );
        })}
      </div>

      {hasVoted && (
        <div className="vote-confirmation">
          <p>✅ Ваш голос зараховано</p>
          <p className="vote-wait">Чекаємо на інших гравців...</p>
        </div>
      )}
    </div>
  );
}