import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  getRooms,
  joinRoom
} from "../services/roomService";

import TableCard from "../components/rooms/TableCard";

import type {
  Room
} from "../types/Room";

import "../styles/rooms.css";

export default function RoomsPage() {
  const navigate =
    useNavigate();

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const loadRooms = async () => {
    try {
      const result =
        await getRooms();

      setRooms(result);
    }
    catch (error) {
      console.error(error);
    }
  };

  const handleJoinRoom =
    async (
      roomId: string
    ) => {
      try {
        await joinRoom({
          roomId
        });

        navigate(
          `/rooms/${roomId}`
        );
      }
      catch (error) {
        console.error(error);

        alert(
          "Failed to join room"
        );
      }
    };

  useEffect(() => {
    void loadRooms();
  }, []);

  return (
    <div className="rooms-page">

      <h1 className="rooms-title">
        ЗАЛ МАФІЇ
      </h1>

      <p className="rooms-subtitle">
        Активних столів: {rooms.length}
      </p>

      <div className="rooms-grid">

        {rooms.map(
          (
            room,
            index
          ) => (
            <TableCard
              key={room.id}
              roomId={room.id}
              title={`Стіл #${index + 1}`}
              playersCount={
                room.playersCount
              }
              maxPlayers={
                room.maxPlayers
              }
              isPrivate={
                room.isPrivate
              }
              onJoin={() =>
                handleJoinRoom(
                  room.id
                )
              }
            />
          )
        )}

      </div>

    </div>
  );
}