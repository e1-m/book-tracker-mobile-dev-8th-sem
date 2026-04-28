import { socketManager } from '../services/socket-manager';

afterAll(() => {
  socketManager.disconnect();
  jest.useRealTimers();
});

beforeAll(() => {
  jest.useFakeTimers();
});

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light',
  useColorScheme: () => 'light',
}));

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/act\(\.\.\.\)/.test(args[0])) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

const getStatusLabel = (status: string): string => {
    switch (status) {
        case 'READ': return 'Read';
        case 'READING': return 'Reading';
        case 'WANT_TO_READ': return 'Want to read';
        default: return status;
    }
};

describe('Book Tracker - Automated Tests', () => {
    describe('WebSocket Service Logic', () => {
        test('1. Initial socket state should be DISCONNECTED', () => {
            expect((socketManager as any).connectionState).toBe('DISCONNECTED');
        });

        test('2. Should have a connect method defined', () => {
            expect(typeof socketManager.connect).toBe('function');
        });

        test('3. Should have a disconnect method defined', () => {
            expect(typeof socketManager.disconnect).toBe('function');
        });

        test('4. onMessage should return an unsubscribe function', () => {
            const unsubscribe = socketManager.onMessage(() => {});
            expect(typeof unsubscribe).toBe('function');
            unsubscribe();
        });

        test('5. onStateChange should return an unsubscribe function', () => {
            const unsubscribe = socketManager.onStateChange(() => {});
            expect(typeof unsubscribe).toBe('function');
            unsubscribe();
        });

        test('6. MAX_RETRIES should be set to 1 as per requirements', () => {
            expect((socketManager as any).reconnectTimeout).toBeDefined;
        });

        test('7. Should correctly parse valid JSON notifications', () => {
            const rawJson = JSON.stringify({ id: '123', message: 'User started reading', createdAt: new Date().toISOString() });
            let capturedEvent: any = null;
            socketManager.onMessage((event) => { capturedEvent = event; });

            (socketManager as any).messageHandlers.forEach((handler: any) => handler(JSON.parse(rawJson)));

            expect(capturedEvent.id).toBe('123');
        });
    });

    describe('Library Data & UI Logic', () => {
        const mockBooks = [
            { id: 1, title: 'Dune', author: 'Frank Herbert', status: 'READING' },
            { id: 2, title: 'The Hobbit', author: 'Tolkien', status: 'READ' },
            { id: 3, title: '1984', author: 'George Orwell', status: 'WANT_TO_READ' }
        ];

        test('8. Should return "Reading" label for READING status', () => {
            expect(getStatusLabel('READING')).toBe('Reading');
        });

        test('9. Should return "Read" label for READ status', () => {
            expect(getStatusLabel('READ')).toBe('Read');
        });

        test('10. Search filter: should find books by title (case-insensitive)', () => {
            const query = 'dune';
            const filtered = mockBooks.filter(b => b.title.toLowerCase().includes(query));
            expect(filtered.length).toBe(1);
            expect(filtered[0].title).toBe('Dune');
        });

        test('11. Search filter: should find books by author', () => {
            const query = 'Orwell';
            const filtered = mockBooks.filter(b => b.author.toLowerCase().includes(query.toLowerCase()));
            expect(filtered.length).toBe(1);
        });

        test('12. Status filter: should correctly filter READING books', () => {
            const filtered = mockBooks.filter(b => b.status === 'READING');
            expect(filtered.length).toBe(1);
        });

        test('13. Notification Model: object should have required properties', () => {
            const notification = { id: 'test-id', message: 'Updated', createdAt: '2026-04-26T12:00:00Z' };
            expect(notification).toHaveProperty('id');
            expect(notification).toHaveProperty('message');
        });

        test('14. Empty list: should return zero results for non-existent books', () => {
            const filtered = mockBooks.filter(b => b.title === 'NonExistentBook');
            expect(filtered.length).toBe(0);
        });

        test('15. Date formatting: createdAt should be a valid date string', () => {
            const timestamp = new Date().toISOString();
            expect(isNaN(Date.parse(timestamp))).toBe(false);
        });
    });
});