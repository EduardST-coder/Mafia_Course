import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  getRoomPlayers,
  chooseSeat
} from "../services/roomService";

import type {
  RoomPlayer
} from "../types/RoomPlayer";

import HostInfo from "../components/room/HostInfo";

import "../styles/roomLobby.css";

export default function RoomLobbyPage() {
  const { roomId } =
    useParams();

  const [players, setPlayers] =
    useState<RoomPlayer[]>([]);

  const loadPlayers = async (
    currentRoomId: string
  ) => {
    try {
      const result =
        await getRoomPlayers(
          currentRoomId
        );

      setPlayers(
        result
      );
    }
    catch (error) {
      console.error(
        error
      );
    }
  };

  const handleChooseSeat =
    async (
      seatNumber: number
    ) => {
      if (!roomId) {
        return;
      }

      try {
        await chooseSeat(
          roomId,
          seatNumber
        );

        await loadPlayers(
          roomId
        );
      }
      catch (error) {
        console.error(
          error
        );

        alert(
          "Не вдалося зайняти місце"
        );
      }
    };

  useEffect(() => {
    if (!roomId) {
      return;
    }

    getRoomPlayers(roomId)
      .then(setPlayers)
      .catch(console.error);
  }, [roomId]);

  const renderSeat =
    (
      seatNumber: number
    ) => {
      const player =
        players.find(
          x =>
            x.seatNumber ===
            seatNumber
        );

      if (player) {
        return (
          <div
            className="seat occupied"
          >
            <div className="seat-number">
              №{seatNumber}
            </div>

            <div className="seat-video">
              Camera
            </div>

            <div className="seat-name">
              {
                player.nickname
              }
            </div>
          </div>
        );
      }

      return (
        <div
          className="seat empty"
          onClick={() =>
            handleChooseSeat(
              seatNumber
            )
          }
        >
          <div className="seat-number">
            №{seatNumber}
          </div>

          <div className="seat-video">
            Вільне місце
          </div>

          <div className="seat-name">
            Натисніть щоб сісти
          </div>
        </div>
      );
    };

  return (
    <div className="room-page">

      <div className="table-layout">

        <div className="seat-10">
          {renderSeat(10)}
        </div>

        <div className="table-logo">
          MAFIA
        </div>

        <div className="seat-1">
          {renderSeat(1)}
        </div>

        <div className="seat-2">
          {renderSeat(2)}
        </div>

        <div className="seat-3">
          {renderSeat(3)}
        </div>

        <div className="seat-4">
          {renderSeat(4)}
        </div>

        <div className="seat-5">
          {renderSeat(5)}
        </div>

        <div className="seat-6">
          {renderSeat(6)}
        </div>

        <div className="seat-7">
          {renderSeat(7)}
        </div>

        <div className="seat-8">
          {renderSeat(8)}
        </div>

        <div className="seat-9">
          {renderSeat(9)}
        </div>

      </div>

      <HostInfo
        hostName="Andrew"
      />

    </div>
  );
}