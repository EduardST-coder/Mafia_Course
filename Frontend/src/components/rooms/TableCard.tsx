type Props = {
  roomId: string;
  title: string;
  playersCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  onJoin: () => void;
};

export default function TableCard({
  title,
  playersCount,
  maxPlayers,
  isPrivate,
  onJoin
}: Props) {
  const isFull =
    playersCount >= maxPlayers;

  return (
    <div className="table-card">

      <div className="table-header">
        {isPrivate && "🔒 "}
        {title}
      </div>

      <div className="table-players">
        {playersCount} / {maxPlayers}
      </div>

      <div className="table-status">
        {isFull
          ? "Стіл заповнений"
          : "Очікування гравців"}
      </div>

      <button
        disabled={isFull}
        className="table-button"
        onClick={onJoin}
      >
        {isFull
          ? "Повний"
          : "Сісти"}
      </button>

    </div>
  );
}