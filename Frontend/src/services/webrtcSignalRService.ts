import * as signalR from '@microsoft/signalr';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://localhost:7000';

type Callback = (...args: unknown[]) => void;

class WebRTCSignalRService {
  private connection: signalR.HubConnection | null = null;

  async connect(token: string): Promise<void> {
    if (
      this.connection &&
      (
        this.connection.state === signalR.HubConnectionState.Connected ||
        this.connection.state === signalR.HubConnectionState.Connecting
      )
    ) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/webrtc`, {
        accessTokenFactory: () => token,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onreconnecting((err) => {
      console.warn('WebRTC Hub reconnecting...', err);
    });

    this.connection.onreconnected((connectionId) => {
      console.log(
        'WebRTC Hub reconnected:',
        connectionId
      );
    });

    this.connection.onclose((err) => {
      console.warn('WebRTC Hub closed', err);
    });

    await this.connection.start();

    console.log(
      'WebRTC Hub connected:',
      this.connection.connectionId
    );
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
    } finally {
      this.connection = null;
    }
  }

  isConnected(): boolean {
    return (
      this.connection?.state ===
      signalR.HubConnectionState.Connected
    );
  }

  getConnectionId(): string | undefined {
    return this.connection?.connectionId ?? undefined;
  }

  async joinCall(
    roomId: string,
    userId: string
  ): Promise<void> {
    await this.connection?.invoke(
      'JoinCall',
      roomId,
      userId
    );
  }

  async sendOffer(
    roomId: string,
    targetConnectionId: string,
    sdp: string
  ): Promise<void> {
    await this.connection?.invoke(
      'SendOffer',
      roomId,
      targetConnectionId,
      sdp
    );
  }

  async sendAnswer(
    roomId: string,
    targetConnectionId: string,
    sdp: string
  ): Promise<void> {
    await this.connection?.invoke(
      'SendAnswer',
      roomId,
      targetConnectionId,
      sdp
    );
  }

  async sendIceCandidate(
    roomId: string,
    targetConnectionId: string,
    candidate: string
  ): Promise<void> {
    await this.connection?.invoke(
      'SendIceCandidate',
      roomId,
      targetConnectionId,
      candidate
    );
  }

  on(
    eventName: string,
    callback: Callback
  ): void {
    this.connection?.off(eventName);
    this.connection?.on(eventName, callback);
  }

  off(eventName: string): void {
    this.connection?.off(eventName);
  }

  get state():
    | signalR.HubConnectionState
    | undefined {
    return this.connection?.state;
  }
}

export const webrtcSignalRService =
  new WebRTCSignalRService();