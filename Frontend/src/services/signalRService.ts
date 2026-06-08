import * as signalR from '@microsoft/signalr';

// Той самий порт що HTTP API (7000), а не 7001
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7000';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SignalRCallback = (...args: any[]) => void;

class SignalRService {
  private _connection: signalR.HubConnection | null = null;

  async connect(hubUrl: string, token: string): Promise<void> {
    const fullUrl = `${API_URL}${hubUrl}`;
    console.log('SignalR connecting to:', fullUrl); // ← для дебагу
    
    this._connection = new signalR.HubConnectionBuilder()
      .withUrl(fullUrl, {
        accessTokenFactory: () => token,
        // Додаємо transport fallback
        transport: signalR.HttpTransportType.WebSockets | 
                   signalR.HttpTransportType.ServerSentEvents | 
                   signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this._connection.start();
      console.log('SignalR connected successfully');
    } catch (err) {
      console.error('SignalR connection failed:', err);
      throw err;
    }
  }

  get connection(): signalR.HubConnection | null {
    return this._connection;
  }

  async joinRoom(roomId: string): Promise<void> {
    await this._connection?.invoke('JoinRoom', roomId);
  }

  async leaveRoom(roomId: string): Promise<void> {
    await this._connection?.invoke('LeaveRoom', roomId);
  }

  async sendMessage(roomId: string, message: string): Promise<void> {
    await this._connection?.invoke('SendMessage', roomId, message);
  }

  async vote(roomId: string, targetId: string): Promise<void> {
    await this._connection?.invoke('Vote', roomId, targetId);
  }

  async roleAction(roomId: string, action: string, targetId: string): Promise<void> {
    await this._connection?.invoke('RoleAction', roomId, action, targetId);
  }

  async ready(roomId: string): Promise<void> {
    await this._connection?.invoke('PlayerReady', roomId);
  }

  on(event: string, callback: SignalRCallback): void {
    this._connection?.on(event, callback);
  }

  off(event: string): void {
    this._connection?.off(event);
  }

  disconnect(): Promise<void> | undefined {
    return this._connection?.stop();
  }

  get state(): signalR.HubConnectionState | undefined {
    return this._connection?.state;
  }
}

export const signalRService = new SignalRService();