import type { RoomPlayer } from '../../types';

interface SpeakerIndicatorProps {
  seat: number;
  player: RoomPlayer | undefined;
  isMyTurn: boolean;
}

export function SpeakerIndicator({ seat, player, isMyTurn }: SpeakerIndicatorProps) {
  return (
    <div className={`speaker-indicator ${isMyTurn ? 'my-turn' : ''}`}>
      <div className="speaker-label">🎤 Зараз говорить</div>
      <div className="speaker-name">
        Місце #{seat}: {player?.user?.nickname || 'Невідомий'}
      </div>
      {isMyTurn && (
        <div className="speech-hint">
          У вас 60 секунд. Закінчіть "Дякую" або натисніть кнопку
        </div>
      )}
    </div>
  );
}