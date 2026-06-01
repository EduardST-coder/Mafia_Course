import * as signalR from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7001';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  async connect(hubUrl: string, token: string): Promise<signalR.HubConnection> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}${hubUrl}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    await this.connection.start();
    return this.connection;
  }

  async joinRoom(roomId: string): Promise<void> {
    await this.connection?.invoke('JoinRoom', roomId);
  }

  async leaveRoom(roomId: string): Promise<void> {
    await this.connection?.invoke('LeaveRoom', roomId);
  }

  async sendMessage(roomId: string, message: string): Promise<void> {
    await this.connection?.invoke('SendMessage', roomId, message);
  }

  async vote(roomId: string, targetId: string): Promise<void> {
    await this.connection?.invoke('Vote', roomId, targetId);
  }

  async roleAction(roomId: string, action: string, targetId: string): Promise<void> {
    await this.connection?.invoke('RoleAction', roomId, action, targetId);
  }

  async ready(roomId: string): Promise<void> {
    await this.connection?.invoke('PlayerReady', roomId);
  }

  on<T = unknown>(event: string, callback: (arg: T) => void): void {
    this.connection?.on(event, (arg: T) => callback(arg));
  }

  off(event: string): void {
    this.connection?.off(event);
  }

  disconnect(): Promise<void> | undefined {
    return this.connection?.stop();
  }

  get state(): signalR.HubConnectionState | undefined {
    return this.connection?.state;
  }
}

export const signalRService = new SignalRService();