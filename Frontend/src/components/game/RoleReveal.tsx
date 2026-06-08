import { useState } from 'react';

interface RoleRevealProps {
  role: string | null;
  onClose: () => void;
}

const ROLE_CONFIG: Record<string, { color: string; icon: string; name: string; desc: string }> = {
  Civilian: { color: '#e53e3e', icon: '👍', name: 'Мирний житель', desc: 'Ваше завдання — знайти мафію і проголосувати проти неї' },
  Sheriff: { color: '#38a169', icon: '🛡️', name: 'Шериф', desc: 'Ви можете перевіряти гравців вночі. Не розкривайте себе без причини!' },
  Mafia: { color: '#1a202c', icon: '👎', name: 'Мафія', desc: 'Ваше завдання — знищити мирних. Працюйте разом з Доном.' },
  Don: { color: '#1a202c', icon: '💍', name: 'Дон', desc: 'Ви керуєте мафією. Шукаєте Шерифа. Вирішуйте, кого вбити.' },
};

export function RoleReveal({ role, onClose }: RoleRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const config = role ? ROLE_CONFIG[role] : null;

  if (!config) return null;

  return (
    <div className="role-reveal-overlay">
      <div className="role-reveal-card" style={{ borderColor: config.color }}>
        {!revealed ? (
          <>
            <div className="role-card-back">🎴</div>
            <h2>Ваша роль</h2>
            <button onClick={() => setRevealed(true)} className="btn-reveal">
              Перевернути карту
            </button>
          </>
        ) : (
          <>
            <div className="role-icon" style={{ color: config.color }}>{config.icon}</div>
            <h2 style={{ color: config.color }}>{config.name}</h2>
            <p className="role-desc">{config.desc}</p>
            <button onClick={onClose} className="btn-close">Закрити</button>
          </>
        )}
      </div>
    </div>
  );
}