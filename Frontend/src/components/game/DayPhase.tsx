import type { RoomPlayer } from '../../types';

interface DayPhaseProps {
  players: RoomPlayer[];
  currentSpeakerSeat: number | null;
  mySeat: number;
  isAlive: boolean;
  onEndSpeech: () => void;
  isMyTurn: boolean;
}

export function DayPhase({ players, currentSpeakerSeat, mySeat, isAlive, onEndSpeech, isMyTurn }: DayPhaseProps) {
  if (!isAlive) {
    return (
      <div className="day-phase spectator">
        <h2>☀️ День</h2>
        <p>Ви спостерігаєте за денним колом</p>
      </div>
    );
  }

  const currentSpeaker = players.find(p => p.seatNumber === currentSpeakerSeat);

  return (
    <div className="day-phase">
      <h2>☀️ День — Коло промов</h2>
      
      <div className="speaker-info">
        {currentSpeaker ? (
          <div className="current-speaker">
            <span className="speaker-label">🎤 Зараз говорить:</span>
            <span className="speaker-name">
              Місце #{currentSpeaker.seatNumber}: {currentSpeaker.user?.nickname}
            </span>
          </div>
        ) : (
          <p>Очікування на початок кола...</p>
        )}
      </div>

      <div className="players-circle">
        {players
          .filter(p => p.status === 'Alive')
          .sort((a, b) => a.seatNumber - b.seatNumber)
          .map(p => (
            <div 
              key={p.id} 
              className={`circle-player ${p.seatNumber === currentSpeakerSeat ? 'speaking' : ''} ${p.seatNumber === mySeat ? 'me' : ''}`}
            >
              <div className="circle-seat">#{p.seatNumber}</div>
              <div className="circle-name">{p.user?.nickname}</div>
              {p.seatNumber === currentSpeakerSeat && <div className="speaking-indicator">🎤</div>}
            </div>
          ))}
      </div>

      {isMyTurn && (
        <div className="my-speech-panel">
          <p className="speech-hint">🎤 Ваша промова! (60 секунд)</p>
          <p className="speech-hint">Закінчіть словом "Дякую" або натисніть кнопку</p>
          <button onClick={onEndSpeech} className="btn-end-speech">
            ✅ Дякую
          </button>
        </div>
      )}

      {!isMyTurn && currentSpeakerSeat !== null && (
        <div className="waiting-speech">
          <p>Зараз говорить гравець #{currentSpeakerSeat}</p>
          <p className="wait-hint">Чекайте своєї черги...</p>
        </div>
      )}
    </div>
  );
}