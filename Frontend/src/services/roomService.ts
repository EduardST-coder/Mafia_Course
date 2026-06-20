import { apiClient } from "../api/apiClient";
import type {
  Room,
  CreateRoomRequest,
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
  roomId: string,
  password?: string
) {
  const response =
    await apiClient.post(
      `/rooms/${roomId}/join`,
      { password }
    );

  return response.data;
}

export async function leaveRoom(
  roomId: string,
  userId: string
) {
  const response =
    await apiClient.post(
      "/rooms/leave",
      {
        roomId,
        userId,
      }
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
        seatNumber,
      }
    );

  return response.data;
}