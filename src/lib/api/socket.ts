import { SSEMessage } from '@/types';

export class WebSocketClient {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000; // 3 seconds
    private onMessageCallback?: (message: SSEMessage) => void;
    private onErrorCallback?: (error: Event) => void;
    private onConnectCallback?: () => void;
    private url: string;

    constructor(eventCode: string, url: string) {
        this.url = url.replace("http://", "ws://").replace("https://", "wss://");
    }

    connect(): void {
        console.log('Connecting to WebSocket:', this.url);

        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('WebSocket connection opened');
            this.reconnectAttempts = 0;
            this.onConnectCallback?.();
        };

        this.socket.onmessage = (event) => {
            try {
                const data: SSEMessage = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                this.onMessageCallback?.(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onerror = (event) => {
            console.error('WebSocket connection error:', event);
            this.onErrorCallback?.(event);
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
            this.handleReconnect();
        };
    }

    private handleReconnect(): void {
        if (this.socket) {
            this.socket = null;
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
        if (this.socket) {
            this.socket.onclose = null; // Prevent reconnect on manual disconnect
            this.socket.close();
            this.socket = null;
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
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }
}

// Factory function to create WebSocket client
export function createWebSocketClient(eventCode: string, streamUrl: string): WebSocketClient {
    return new WebSocketClient(eventCode, streamUrl);
}
