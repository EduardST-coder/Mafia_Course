import type { GameMessage } from '../../types/Game';

interface ChatProps {
  messages: GameMessage[];
  onSend: (e: React.FormEvent) => void;
  text: string;
  setText: (text: string) => void;
}

export const Chat = ({ messages, onSend, text, setText }: ChatProps) => (
  <div className="game-chat">
    <h3>💬 Чат</h3>
    <div className="messages">
      {messages.map((m, i) => (
        <div key={i} className={`message ${m.isSystem ? 'system' : ''}`}>
          <strong>{m.sender}:</strong> {m.text}
        </div>
      ))}
    </div>
    <form onSubmit={onSend}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Напишіть повідомлення..."
      />
      <button type="submit">➤</button>
    </form>
  </div>
);