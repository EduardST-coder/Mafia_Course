type Props = {
  seatNumber: number;

  nickname: string;

  onClick?: () => void;
};

export default function Seat({
  seatNumber,
  nickname,
  onClick
}: Props) {
  return (
    <div
      className="seat"
      onClick={onClick}
      style={{
        cursor: onClick
          ? "pointer"
          : "default"
      }}
    >
      <div className="seat-number">
        {seatNumber}
      </div>

      <div className="seat-video">
        Camera
      </div>

      <div className="seat-name">
        {nickname}
      </div>
    </div>
  );
}