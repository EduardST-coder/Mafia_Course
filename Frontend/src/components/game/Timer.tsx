interface TimerProps {
  timeRemaining: number;
}

export function Timer({ timeRemaining }: TimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className={`game-timer ${isUrgent ? 'urgent' : ''}`}>
      <span className="timer-icon">⏱️</span>
      <span className="timer-value">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}