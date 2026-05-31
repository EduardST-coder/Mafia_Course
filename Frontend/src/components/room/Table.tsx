import Seat from "./Seat";

import type {
  RoomPlayer
} from "../../types/RoomPlayer";

type Props = {
  players: RoomPlayer[];

  onChooseSeat: (
    seatNumber: number
  ) => void;
};

export default function Table({
  players,
  onChooseSeat
}: Props) {

  const renderSeat = (
    seatNumber: number
  ) => {
    const player =
      players.find(
        x =>
          x.seatNumber ===
          seatNumber
      );

    return (
      <Seat
        seatNumber={
          seatNumber
        }
        nickname={
          player
            ? player.nickname
            : "Вільне місце"
        }
        onClick={() => {
          if (!player) {
            onChooseSeat(
              seatNumber
            );
          }
        }}
      />
    );
  };

  return (
    <div className="table-layout">

      <div className="seat seat-10">
        {renderSeat(10)}
      </div>

      <div className="table-logo">
        MAFIA
      </div>

      <div className="seat seat-1">
        {renderSeat(1)}
      </div>

      <div className="seat seat-2">
        {renderSeat(2)}
      </div>

      <div className="seat seat-9">
        {renderSeat(9)}
      </div>

      <div className="seat seat-3">
        {renderSeat(3)}
      </div>

      <div className="seat seat-8">
        {renderSeat(8)}
      </div>

      <div className="seat seat-4">
        {renderSeat(4)}
      </div>

      <div className="seat seat-7">
        {renderSeat(7)}
      </div>

      <div className="seat seat-6">
        {renderSeat(6)}
      </div>

      <div className="seat seat-5">
        {renderSeat(5)}
      </div>

    </div>
  );
}