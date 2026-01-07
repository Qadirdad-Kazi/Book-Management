import { jest } from '@jest/globals';

// Mock Book model
jest.unstable_mockModule('../backend/models/bookModel.js', () => ({
    Book: {
        find: jest.fn(),
        findById: jest.fn(),
    }
}));

// Import Service after mocking
const { Book } = await import('../backend/models/bookModel.js');
const LibraryService = (await import('../backend/services/libraryService.js')).default;

describe('Library Module Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('UT05: Search Book', () => {
        it('should find a book when valid query provided', async () => {
            const mockBook = { title: 'Python Programming', author: 'Guido' };
            Book.find.mockResolvedValue([mockBook]);

            const result = await LibraryService.searchBooks('Python');

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Python Programming');
            expect(Book.find).toHaveBeenCalledWith(expect.objectContaining({
                $or: expect.arrayContaining([
                    { title: { $regex: /Python/i } }
                ])
            }));
        });

        it('should return empty list if no query', async () => {
            const result = await LibraryService.searchBooks('');
            expect(result).toEqual([]);
        });
    });

    describe('UT08: Borrow Book', () => {
        it('should successfully borrow an available book', async () => {
            const mockSave = jest.fn().mockResolvedValue({
                _id: '101',
                status: 'Borrowed',
                title: 'Learn JS'
            });

            const mockBook = {
                _id: '101',
                title: 'Learn JS',
                status: 'Available',
                save: mockSave
            };

            Book.findById.mockResolvedValue(mockBook);

            const result = await LibraryService.borrowBook('101');

            expect(mockBook.status).toBe('Borrowed');
            expect(mockSave).toHaveBeenCalled();
            expect(result.status).toBe('Borrowed');
        });

        it('should throw error if book is already borrowed', async () => {
            const mockBook = {
                _id: '101',
                status: 'Borrowed',
                title: 'Learn JS'
            };

            Book.findById.mockResolvedValue(mockBook);

            await expect(LibraryService.borrowBook('101'))
                .rejects
                .toThrow('Book is already borrowed');
        });
    });

    describe('UT11: Return Book', () => {
        it('should return a borrowed book and update inventory', async () => {
            const mockSave = jest.fn().mockResolvedValue({
                _id: '101',
                status: 'Available',
                title: 'Learn JS'
            });

            const mockBook = {
                _id: '101',
                title: 'Learn JS',
                status: 'Borrowed',
                save: mockSave
            };

            Book.findById.mockResolvedValue(mockBook);

            const result = await LibraryService.returnBook('101');

            expect(mockBook.status).toBe('Available');
            expect(mockSave).toHaveBeenCalled();
            expect(result.status).toBe('Available');
        });
    });

    describe('UT13: Calculate Fine', () => {
        it('should calculate fine correctly for late return (3 days)', () => {
            const dueDate = new Date('2023-01-01');
            const returnDate = new Date('2023-01-04'); // 3 days late

            const fine = LibraryService.calculateFine(dueDate, returnDate);

            // Fine = 3 days * 10 = 30
            expect(fine).toBe(30);
        });

        it('should be 0 fine if returned on due date', () => {
            const dueDate = new Date('2023-01-01');
            const returnDate = new Date('2023-01-01');

            const fine = LibraryService.calculateFine(dueDate, returnDate);

            expect(fine).toBe(0);
        });

        it('should be 0 fine if returned early', () => {
            const dueDate = new Date('2023-01-05');
            const returnDate = new Date('2023-01-01');

            const fine = LibraryService.calculateFine(dueDate, returnDate);

            expect(fine).toBe(0);
        });
    });
});
