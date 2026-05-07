export type SocketConnectionState =
    | 'DISCONNECTED'
    | 'CONNECTING'
    | 'CONNECTED'
    | 'RECONNECTING';

export type NotificationEvent = {
    id: string;
    message: string;
    createdAt: string;
};