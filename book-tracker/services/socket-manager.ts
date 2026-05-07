import {
    NotificationEvent,
    SocketConnectionState,
} from './socket-events';

type MessageHandler = (event: NotificationEvent) => void;
type StateHandler = (state: SocketConnectionState) => void;

export class SocketManager {
    private socket: WebSocket | null = null;
    private url: string | null = null;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private manuallyClosed = false;

    private connectionState: SocketConnectionState = 'DISCONNECTED';
    private messageHandlers = new Set<MessageHandler>();
    private stateHandlers = new Set<StateHandler>();

    onMessage(handler: MessageHandler) {
        this.messageHandlers.add(handler);
        return () => {
            this.messageHandlers.delete(handler);
        };
    }

    onStateChange(handler: StateHandler) {
        this.stateHandlers.add(handler);
        handler(this.connectionState);

        return () => {
            this.stateHandlers.delete(handler);
        };
    }

    private setState(nextState: SocketConnectionState) {
        this.connectionState = nextState;
        this.stateHandlers.forEach((handler) => handler(nextState));
    }

    connect(url: string) {
        if (
            this.socket &&
            (this.connectionState === 'CONNECTED' ||
                this.connectionState === 'CONNECTING')
        ) {
            return;
        }

        this.url = url;
        this.manuallyClosed = false;
        this.setState('CONNECTING');

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.setState('CONNECTED');
        };

        this.socket.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data) as NotificationEvent;
                this.messageHandlers.forEach((handler) => handler(parsed));
            } catch (error) {
                console.error('Failed to parse socket message:', error);
            }
        };

        this.socket.onclose = () => {
            this.socket = null;

            if (!this.manuallyClosed && this.url) {
                this.setState('RECONNECTING');

                this.reconnectTimeout = setTimeout(() => {
                    this.connect(this.url!);
                }, 2000);
            } else {
                this.setState('DISCONNECTED');
            }
        };
    }

    disconnect() {
        this.manuallyClosed = true;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        this.setState('DISCONNECTED');
    }
}

export const socketManager = new SocketManager();