import { apiClient } from "../api/apiClient";
import type { Room, CreateRoomRequest, JoinRoomRequest } from "../types/Room";

// Тип для помилки axios
interface ApiError {
  response?: {
    status?: number;
    data?: unknown;
  };
}

export async function getRooms() {
  const response = await apiClient.get<Room[]>("/rooms");
  return response.data;
}

export async function createRoom(request: CreateRoomRequest) {
  const response = await apiClient.post("/rooms", request);
  return response.data;
}

export async function joinRoom(request: JoinRoomRequest) {
  const response = await apiClient.post("/rooms/join", request);
  return response.data;
}

export async function getRoomPlayers(roomId: string) {
  const response = await apiClient.get(`/rooms/${roomId}/players`);
  return response.data;
}

export async function chooseSeat(roomId: string, seatNumber: number) {
  console.log('API: chooseSeat called', { roomId, seatNumber });
  
  try {
    const response = await apiClient.post(
      `/rooms/${roomId}/seat`,
      { seatNumber }
    );
    console.log('API: chooseSeat success (URL)', response.data);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    console.log('API: chooseSeat URL failed, trying body...', err.response?.status);
    
    try {
      const response = await apiClient.post(
        "/rooms/seat",
        { roomId, seatNumber }
      );
      console.log('API: chooseSeat success (body)', response.data);
      return response.data;
    } catch (error2: unknown) {
      const err2 = error2 as ApiError;
      console.error('API: chooseSeat failed completely', err2.response?.data);
      throw error2;
    }
  }
}