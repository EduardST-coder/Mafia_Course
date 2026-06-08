import type { ChatMessage } from '../../types';

interface ChatProps {
  messages: ChatMessage[];
  onSend: (e: React.FormEvent) => void;
  text: string;
  setText: (text: string) => void;
}

export const Chat = ({ messages, onSend, text, setText }: ChatProps) => (
  <div className="game-chat">
    <h3>💬 Чат</h3>
    <div className="messages">
      {messages.map((m) => (
        <div key={m.id} className={`message ${m.isSystem ? 'system' : ''}`}>
          <strong>{m.senderNickname}:</strong> {m.text}
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