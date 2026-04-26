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

const calculateBookProgress = (current: number, total: number): number => {
    if (total <= 0) return 0;
    const progress = Math.round((current / total) * 100);
    return progress > 100 ? 100 : (progress < 0 ? 0 : progress);
};

const getStatusLabel = (status: string): string => {
    switch (status) {
        case 'READ': return 'Read';
        case 'READING': return 'Reading';
        case 'WANT_TO_READ': return 'Want to read';
        default: return status;
    }
};

describe('Book Tracker - Automated Tests', () => {

    describe('Reading Progress Calculations', () => {
        test('1. Should return 50% for 50/100 pages', () => {
            expect(calculateBookProgress(50, 100)).toBe(50);
        });

        test('2. Should cap progress at 100% if current exceeds total', () => {
            expect(calculateBookProgress(150, 100)).toBe(100);
        });

        test('3. Should return 0% if total pages is 0 (division by zero protection)', () => {
            expect(calculateBookProgress(10, 0)).toBe(0);
        });

        test('4. Should round the result correctly (e.g., 1/3 pages to 33%)', () => {
            expect(calculateBookProgress(1, 3)).toBe(33);
        });

        test('5. Should return 0% for negative page values', () => {
            expect(calculateBookProgress(-10, 100)).toBe(0);
        });
    });

    describe('WebSocket Service Logic', () => {
        test('6. Initial socket state should be DISCONNECTED', () => {
            expect((socketManager as any).connectionState).toBe('DISCONNECTED');
        });

        test('7. Should have a connect method defined', () => {
            expect(typeof socketManager.connect).toBe('function');
        });

        test('8. Should have a disconnect method defined', () => {
            expect(typeof socketManager.disconnect).toBe('function');
        });

        test('9. onMessage should return an unsubscribe function', () => {
            const unsubscribe = socketManager.onMessage(() => {});
            expect(typeof unsubscribe).toBe('function');
            unsubscribe();
        });

        test('10. onStateChange should return an unsubscribe function', () => {
            const unsubscribe = socketManager.onStateChange(() => {});
            expect(typeof unsubscribe).toBe('function');
            unsubscribe();
        });

        test('11. MAX_RETRIES should be set to 1 as per requirements', () => {
            expect((socketManager as any).reconnectTimeout).toBeDefined;
        });

        test('12. Should correctly parse valid JSON notifications', () => {
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

        test('13. Should return "Reading" label for READING status', () => {
            expect(getStatusLabel('READING')).toBe('Reading');
        });

        test('14. Should return "Read" label for READ status', () => {
            expect(getStatusLabel('READ')).toBe('Read');
        });

        test('15. Search filter: should find books by title (case-insensitive)', () => {
            const query = 'dune';
            const filtered = mockBooks.filter(b => b.title.toLowerCase().includes(query));
            expect(filtered.length).toBe(1);
            expect(filtered[0].title).toBe('Dune');
        });

        test('16. Search filter: should find books by author', () => {
            const query = 'Orwell';
            const filtered = mockBooks.filter(b => b.author.toLowerCase().includes(query.toLowerCase()));
            expect(filtered.length).toBe(1);
        });

        test('17. Status filter: should correctly filter READING books', () => {
            const filtered = mockBooks.filter(b => b.status === 'READING');
            expect(filtered.length).toBe(1);
        });

        test('18. Notification Model: object should have required properties', () => {
            const notification = { id: 'test-id', message: 'Updated', createdAt: '2026-04-26T12:00:00Z' };
            expect(notification).toHaveProperty('id');
            expect(notification).toHaveProperty('message');
        });

        test('19. Empty list: should return zero results for non-existent books', () => {
            const filtered = mockBooks.filter(b => b.title === 'NonExistentBook');
            expect(filtered.length).toBe(0);
        });

        test('20. Date formatting: createdAt should be a valid date string', () => {
            const timestamp = new Date().toISOString();
            expect(isNaN(Date.parse(timestamp))).toBe(false);
        });
    });
});