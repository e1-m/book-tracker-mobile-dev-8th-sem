import {SocketManager} from '../services/socket-manager';
import { SocketConnectionState } from '../services/socket-events';

class MockWebSocket {
    url: string;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onmessage: ((event: any) => void) | null = null;
    close = jest.fn();

    constructor(url: string) {
        this.url = url;
    }
}

global.WebSocket = MockWebSocket as any;

describe('SocketManager', () => {
    let manager: SocketManager;

    beforeEach(() => {
        jest.useFakeTimers();
        manager = new SocketManager();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    const getMockSocket = () => (manager as any).socket as MockWebSocket;

    describe('Connection States & Basic Methods', () => {
        it('1. should start with a DISCONNECTED state', () => {
            const stateHandler = jest.fn();
            manager.onStateChange(stateHandler);
            expect(stateHandler).toHaveBeenCalledWith('DISCONNECTED');
        });

        it('2. should transition to CONNECTING when connect is called', () => {
            const stateHandler = jest.fn();
            manager.onStateChange(stateHandler);
            manager.connect('ws://test.com');
            expect(stateHandler).toHaveBeenCalledWith('CONNECTING');
        });

        it('3. should transition to CONNECTED when the socket opens', () => {
            const stateHandler = jest.fn();
            manager.onStateChange(stateHandler);

            manager.connect('ws://test.com');
            getMockSocket().onopen!();

            expect(stateHandler).toHaveBeenCalledWith('CONNECTED');
        });

        it('4. should ignore connect() if already CONNECTING', () => {
            const stateHandler = jest.fn();
            manager.onStateChange(stateHandler);

            manager.connect('ws://test.com');
            const initialSocket = getMockSocket();

            expect(stateHandler).toHaveBeenCalledWith('CONNECTING');

            stateHandler.mockClear();

            manager.connect('ws://test.com');

            expect(getMockSocket()).toBe(initialSocket);
            expect(stateHandler).not.toHaveBeenCalled();
        });

        it('5. should ignore connect() if already CONNECTED', () => {
            const stateHandler = jest.fn();
            manager.onStateChange(stateHandler);

            manager.connect('ws://test.com');
            getMockSocket().onopen!();
            const initialSocket = getMockSocket();

            expect(stateHandler).toHaveBeenCalledWith('CONNECTED');

            stateHandler.mockClear();

            manager.connect('ws://test.com');

            expect(getMockSocket()).toBe(initialSocket);
            expect(stateHandler).not.toHaveBeenCalled();
        });
    });

    describe('Disconnection Logic', () => {
        it('6. should transition to DISCONNECTED and close socket on manual disconnect', () => {
            manager.connect('ws://test.com');
            const ws = getMockSocket();
            const stateHandler = jest.fn();
            manager.onStateChange(stateHandler);

            manager.disconnect();

            expect(ws.close).toHaveBeenCalled();
            expect(stateHandler).toHaveBeenCalledWith('DISCONNECTED');
            expect(getMockSocket()).toBeNull();
        });

        it('7. should never reconnect after disconnect even if socket closes', () => {
            manager.connect('ws://test.com');

            const ws = getMockSocket();

            manager.disconnect();

            ws.onclose?.();

            jest.advanceTimersByTime(5000);

            expect(getMockSocket()).toBeNull();
        });

        it('8. should clear any pending reconnect timeouts when manually disconnected', () => {
            const clearSpy = jest.spyOn(global, 'clearTimeout');

            manager.connect('ws://test.com');

            const socket = getMockSocket();
            socket.onclose!();

            manager.disconnect();

            expect(clearSpy).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(2500);
            expect(getMockSocket()).toBeNull();

            clearSpy.mockRestore();
        });

        it('9. should ignore any socket events after disconnect', () => {
            manager.connect('ws://test.com');

            const ws = getMockSocket();

            manager.disconnect();

            ws.onopen?.();
            ws.onmessage?.({ data: JSON.stringify({ test: 1 }) });
            ws.onclose?.();

            expect(getMockSocket()).toBeNull();
        });

        it('10. should handle multiple disconnect calls safely', () => {
            manager.connect('ws://test.com');
            const ws = getMockSocket();

            manager.disconnect();
            manager.disconnect();

            expect(ws.close).toHaveBeenCalledTimes(1);
            expect(getMockSocket()).toBeNull();
        });

        it('11. should allow reconnect after disconnect', () => {
            manager.connect('ws://test.com');
            manager.disconnect();

            manager.connect('ws://test.com');

            expect(getMockSocket()).not.toBeNull();
        });

        it('12. should ignore socket events after disconnect', () => {
            const stateHandler = jest.fn();
            manager.onStateChange(stateHandler);

            manager.connect('ws://test.com');
            manager.disconnect();

            const ws = getMockSocket();

            stateHandler.mockClear();

            ws?.onopen?.();

            expect(stateHandler).not.toHaveBeenCalled();
        });
    });

    describe('Reconnection Logic (Auto-Retry)', () => {
        it('13. should transition to RECONNECTING on unexpected disconnect', () => {
            const stateHandler = jest.fn();
            manager.connect('ws://test.com');
            manager.onStateChange(stateHandler);

            getMockSocket().onclose!();

            expect(stateHandler).toHaveBeenCalledWith('RECONNECTING');
        });

        it('14. should attempt to reconnect exactly after 2 seconds', () => {
            manager.connect('ws://test.com');
            const initialSocket = getMockSocket();

            initialSocket.onclose!();

            jest.advanceTimersByTime(1999);
            expect(getMockSocket()).toBeNull();

            jest.advanceTimersByTime(1);
            expect(getMockSocket()).toBeDefined();
            expect(getMockSocket()).not.toBe(initialSocket);
        });

        it('15. should reliably perform multiple reconnect cycles', () => {
            manager.connect('ws://test.com');

            const sockets = [];

            let prev = getMockSocket();
            sockets.push(prev);

            for (let i = 0; i < 3; i++) {
                prev.onclose!();
                jest.advanceTimersByTime(2000);

                const current = getMockSocket();

                expect(current).not.toBe(prev);
                expect(current).not.toBeNull();

                sockets.push(current);
                prev = current;
            }

            expect(new Set(sockets).size).toBe(4);
        });
    });

    describe('Message Handling & Parsing', () => {
        it('16. should parse valid JSON and trigger message handlers', () => {
            const messageHandler = jest.fn();
            manager.onMessage(messageHandler);
            manager.connect('ws://test.com');

            const mockData = { type: 'TEST_EVENT', payload: 123 };
            getMockSocket().onmessage!({ data: JSON.stringify(mockData) });

            expect(messageHandler).toHaveBeenCalledWith(mockData);
        });

        it('17. should safely catch errors on invalid JSON without crashing', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const messageHandler = jest.fn();
            manager.onMessage(messageHandler);
            manager.connect('ws://test.com');

            expect(() => {
                getMockSocket().onmessage!({ data: 'invalid{json' });
            }).not.toThrow();

            expect(messageHandler).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to parse socket message:',
                expect.any(SyntaxError)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Subscriptions & Memory Management', () => {
        it('18. should support multiple message subscribers simultaneously', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();
            manager.onMessage(handler1);
            manager.onMessage(handler2);
            manager.connect('ws://test.com');

            const mockData = { id: 1 };
            getMockSocket().onmessage!({ data: JSON.stringify(mockData) });

            expect(handler1).toHaveBeenCalledWith(mockData);
            expect(handler2).toHaveBeenCalledWith(mockData);
        });

        it('19. should allow unsubscribing from messages', () => {
            const handler = jest.fn();
            const unsubscribe = manager.onMessage(handler);
            manager.connect('ws://test.com');

            unsubscribe();

            getMockSocket().onmessage!({ data: JSON.stringify({ id: 1 }) });
            expect(handler).not.toHaveBeenCalled();
        });

        it('20. should allow unsubscribing from state changes', () => {
            const handler = jest.fn();
            const unsubscribe = manager.onStateChange(handler);

            handler.mockClear();

            unsubscribe();

            manager.connect('ws://test.com');

            expect(handler).not.toHaveBeenCalled();
        });
    });
});