import { apiClient } from "../api/apiClient";

import type {
  Room,
  CreateRoomRequest,
  JoinRoomRequest
} from "../types/Room";

export async function getRooms() {
  const response =
    await apiClient.get<Room[]>(
      "/rooms"
    );

  return response.data;
}

export async function createRoom(
  request: CreateRoomRequest
) {
  const response =
    await apiClient.post(
      "/rooms",
      request
    );

  return response.data;
}

export async function joinRoom(
  request: JoinRoomRequest
) {
  const response =
    await apiClient.post(
      "/rooms/join",
      request
    );

  return response.data;
}

export async function getRoomPlayers(
  roomId: string
) {
  const response =
    await apiClient.get(
      `/rooms/${roomId}/players`
    );

  return response.data;
}

export async function chooseSeat(
  roomId: string,
  seatNumber: number
) {
  const response =
    await apiClient.post(
      "/rooms/seat",
      {
        roomId,
        seatNumber
      }
    );

  return response.data;
}