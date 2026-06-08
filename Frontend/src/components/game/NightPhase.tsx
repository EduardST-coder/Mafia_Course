import { useState } from 'react';
import type { RoomPlayer, MafiaKillResult, SheriffCheckResult, DonCheckResult } from '../../types';

interface NightPhaseProps {
  myRole: string | null;
  players: RoomPlayer[];
  mafiaPlayers: RoomPlayer[];
  isMafia: boolean;
  isSheriff: boolean;
  isDon: boolean;
  mafiaKillResult: MafiaKillResult | null;
  sheriffCheckResult: SheriffCheckResult | null;
  donCheckResult: DonCheckResult | null;
  onAction: (targetSeat: number) => void;
  onConfirmMafiaKill?: (targetSeats: number[]) => void;
}

export const NightPhase = ({
  myRole,
  players,
  mafiaPlayers,
  isMafia,
  isSheriff,
  isDon,
  mafiaKillResult,
  sheriffCheckResult,
  donCheckResult,
  onAction,
  onConfirmMafiaKill,
}: NightPhaseProps) => {
  // Мафія вибирає 3 жертви (класичні правила)
  const [selectedVictims, setSelectedVictims] = useState<number[]>([]);
  const [donCheckTarget, setDonCheckTarget] = useState<number | null>(null);
  const [sheriffCheckTarget, setSheriffCheckTarget] = useState<number | null>(null);

  const alivePlayers = players.filter((p) => p.status === 'Alive');
  const myPlayer = players.find((p) => p.userId === localStorage.getItem('userId'));

  // === МИРНИЙ ===
  if (myRole === 'Civilian' || myRole === null) {
    return (
      <div className="night-phase civilian">
        <div className="night-overlay">🌙</div>
        <h2>Ніч</h2>
        <p>Місто спить... Ви — мирний житель.</p>
        <div className="sleep-animation">
          <span>💤</span>
          <span>💤</span>
          <span>💤</span>
        </div>
        <p className="night-hint">Ваша камера та мікрофон вимкнені. Чекайте ранку.</p>
      </div>
    );
  }

  // === МАФІЯ (не Дон) ===
  if (isMafia && !isDon) {
    const toggleVictim = (seat: number) => {
      if (selectedVictims.includes(seat)) {
        setSelectedVictims((prev) => prev.filter((s) => s !== seat));
      } else if (selectedVictims.length < 3) {
        setSelectedVictims((prev) => [...prev, seat]);
      }
    };

    const handleConfirm = () => {
      if (onConfirmMafiaKill && selectedVictims.length > 0) {
        onConfirmMafiaKill(selectedVictims);
      }
    };

    return (
      <div className="night-phase mafia">
        <div className="night-overlay">🌑</div>
        <h2>⚫ Ніч — Мафія прокидається</h2>
        
        <div className="mafia-team-info">
          <h3>Ваша команда:</h3>
          <div className="mafia-partners">
            {mafiaPlayers.map((p) => (
              <div key={p.id} className={`mafia-partner ${p.gameRole === 'Don' ? 'is-don' : ''}`}>
                <span className="partner-role">
                  {p.gameRole === 'Don' ? '💍 Дон' : '👎 Мафія'}
                </span>
                <span className="partner-name">
                  Місце #{p.seatNumber}: {p.user?.nickname}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="night-action">
          <h3>🎯 Виберіть 3 жертви:</h3>
          <p className="action-hint">Дон вирішить, кого вбити з вашого списку</p>
          
          <div className="victims-grid">
            {alivePlayers
              .filter((p) => p.id !== myPlayer?.id && !mafiaPlayers.some((m) => m.id === p.id))
              .map((p) => {
                const isSelected = selectedVictims.includes(p.seatNumber);
                return (
                  <button
                    key={p.id}
                    className={`victim-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleVictim(p.seatNumber)}
                  >
                    <div className="victim-seat">#{p.seatNumber}</div>
                    <div className="victim-name">{p.user?.nickname}</div>
                    {isSelected && <div className="victim-check">✓</div>}
                  </button>
                );
              })}
          </div>

          <div className="selected-victims">
            <span>Обрано: </span>
            {selectedVictims.map((s) => (
              <span key={s} className="victim-tag">#{s}</span>
            ))}
            <span className="victim-count">({selectedVictims.length}/3)</span>
          </div>

          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={selectedVictims.length === 0}
          >
            ✅ Підтвердити вибір
          </button>
        </div>

        {mafiaKillResult && (
          <div className={`action-result ${mafiaKillResult.success ? 'success' : 'fail'}`}>
            <p>{mafiaKillResult.message}</p>
            {mafiaKillResult.targetSeat && (
              <p>Ціль: місце #{mafiaKillResult.targetSeat}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // === ДОН ===
  if (isDon) {
    const handleDonKill = (seat: number) => {
      setDonCheckTarget(seat);
      onAction(seat); // Дон вибирає кого вбити зі списку мафії
    };

    const handleDonCheck = (seat: number) => {
      setDonCheckTarget(seat);
      onAction(seat); // Перевірка на Шерифа
    };

    return (
      <div className="night-phase don">
        <div className="night-overlay">👑</div>
        <h2>💍 Ніч — Дон</h2>

        <div className="mafia-team-info">
          <h3>Ваша команда:</h3>
          <div className="mafia-partners">
            {mafiaPlayers.map((p) => (
              <div key={p.id} className={`mafia-partner ${p.gameRole === 'Don' ? 'is-don' : ''}`}>
                <span className="partner-role">
                  {p.gameRole === 'Don' ? '💍 Ви (Дон)' : '👎 Мафія'}
                </span>
                <span className="partner-name">
                  Місце #{p.seatNumber}: {p.user?.nickname}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="don-actions">
          <div className="action-section">
            <h3>🎯 Вибрати жертву для вбивства</h3>
            <p className="action-hint">Виберіть одного гравця, кого вб'є мафія цієї ночі</p>
            <div className="players-grid">
              {alivePlayers
                .filter((p) => !mafiaPlayers.some((m) => m.id === p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    className={`player-card ${donCheckTarget === p.seatNumber ? 'selected' : ''}`}
                    onClick={() => handleDonKill(p.seatNumber)}
                  >
                    <div className="player-seat">#{p.seatNumber}</div>
                    <div className="player-name">{p.user?.nickname}</div>
                  </button>
                ))}
            </div>
          </div>

          <div className="action-section">
            <h3>🔍 Перевірити на Шерифа</h3>
            <p className="action-hint">Дон може перевірити одного гравця — чи він Шериф</p>
            <div className="players-grid">
              {alivePlayers
                .filter((p) => p.id !== myPlayer?.id && !mafiaPlayers.some((m) => m.id === p.id))
                .map((p) => (
                  <button
                    key={`check-${p.id}`}
                    className="player-card check"
                    onClick={() => handleDonCheck(p.seatNumber)}
                  >
                    <div className="player-seat">#{p.seatNumber}</div>
                    <div className="player-name">{p.user?.nickname}</div>
                    <span className="check-icon">🔍</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {donCheckResult && (
          <div className="action-result">
            <h4>Результат перевірки Дона:</h4>
            <p>
              Місце #{donCheckResult.targetSeat}:{' '}
              <strong className={donCheckResult.isSheriff ? 'sheriff-found' : 'not-sheriff'}>
                {donCheckResult.isSheriff ? '🛡️ Так, це Шериф!' : '❌ Ні, це не Шериф'}
              </strong>
            </p>
          </div>
        )}

        {mafiaKillResult && (
          <div className={`action-result ${mafiaKillResult.success ? 'success' : 'fail'}`}>
            <p>{mafiaKillResult.message}</p>
          </div>
        )}
      </div>
    );
  }

  // === ШЕРИФ ===
  if (isSheriff) {
    const handleSheriffCheck = (seat: number) => {
      setSheriffCheckTarget(seat);
      onAction(seat);
    };

    return (
      <div className="night-phase sheriff">
        <div className="night-overlay">🛡️</div>
        <h2>🛡️ Ніч — Шериф</h2>
        <p className="role-hint">Ви можете перевірити одного гравця на "червоний" (мирний) або "чорний" (мафія)</p>

        <div className="night-action">
          <h3>🔍 Кого перевірити?</h3>
          <div className="players-grid">
            {alivePlayers
              .filter((p) => p.id !== myPlayer?.id)
              .map((p) => (
                <button
                  key={p.id}
                  className={`player-card ${sheriffCheckTarget === p.seatNumber ? 'selected' : ''}`}
                  onClick={() => handleSheriffCheck(p.seatNumber)}
                >
                  <div className="player-seat">#{p.seatNumber}</div>
                  <div className="player-name">{p.user?.nickname}</div>
                </button>
              ))}
          </div>
        </div>

        {sheriffCheckResult && (
          <div className="action-result">
            <h4>Результат перевірки Шерифа:</h4>
            <p>
              Місце #{sheriffCheckResult.targetSeat}:{' '}
              <strong className={sheriffCheckResult.result === 'Red' ? 'red-check' : 'black-check'}>
                {sheriffCheckResult.result === 'Red' ? '🔴 Червоний (мирний)' : '⚫ Чорний (мафія!)'}
              </strong>
            </p>
            <p className="check-hint">
              {sheriffCheckResult.result === 'Red'
                ? 'Цей гравець — мирний житель'
                : 'УВАГА! Цей гравець — мафія!'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className="night-phase">
      <h2>🌙 Ніч</h2>
      <p>Невідома роль: {myRole}</p>
    </div>
  );
};