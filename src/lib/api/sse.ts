import { SSEMessage } from '@/types';

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private onMessageCallback?: (message: SSEMessage) => void;
  private onErrorCallback?: (error: Event) => void;
  private onConnectCallback?: () => void;

  constructor(
    private eventCode: string,
    private streamUrl: string
  ) { }

  connect(): void {
    console.log('Connecting to SSE stream:', this.streamUrl);

    this.eventSource = new EventSource(this.streamUrl, { withCredentials: true });

    this.eventSource.onopen = (event) => {
      console.log('SSE connection opened');
      this.reconnectAttempts = 0;
      this.onConnectCallback?.();
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        console.log('SSE message received:', data);
        this.onMessageCallback?.(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      this.onErrorCallback?.(event);
      this.handleReconnect();
    };
  }

  private handleReconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
  }

  // Event handlers
  onMessage(callback: (message: SSEMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  // Get connection status
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }

  getConnectionAttempts(): number {
    return this.reconnectAttempts;
  }
}

// Factory function to create SSE client
export function createSSEClient(eventCode: string, streamUrl: string): SSEClient {
  return new SSEClient(eventCode, streamUrl);
}