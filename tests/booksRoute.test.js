import { jest } from '@jest/globals';

// Mock Book model
jest.unstable_mockModule('../backend/models/bookModel.js', () => ({
    Book: {
        find: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
    }
}));

// Mock Auth middleware
jest.unstable_mockModule('../backend/middleware/auth.js', () => ({
    auth: (req, res, next) => {
        req.user = { _id: 'test_user_id' };
        next();
    }
}));

// Dynamic imports after mocks
const { Book } = await import('../backend/models/bookModel.js');
const request = (await import('supertest')).default;
const express = (await import('express')).default;
const booksRoute = (await import('../backend/routes/booksRoute.js')).default;

const app = express();
app.use(express.json());
app.use('/books', booksRoute);

describe('Books API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /books', () => {
        it('should return all books', async () => {
            const mockBooks = [{ title: 'Book 1' }, { title: 'Book 2' }];
            Book.find.mockResolvedValue(mockBooks);

            const res = await request(app).get('/books');

            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(2);
            expect(res.body.data).toHaveLength(2);
            expect(Book.find).toHaveBeenCalledWith({});
        });

        it('should handle errors', async () => {
            const errorMessage = 'Database error';
            Book.find.mockRejectedValue(new Error(errorMessage));

            const res = await request(app).get('/books');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe(errorMessage);
        });
    });

    describe('POST /books', () => {
        it('should create a new book', async () => {
            const newBookData = {
                title: 'New Book',
                author: 'Author Name',
                publishYear: 2023
            };

            const mockCreatedBook = {
                ...newBookData,
                _id: 'new_book_id',
                owner: 'test_user_id'
            };

            Book.create.mockResolvedValue(mockCreatedBook);

            const res = await request(app)
                .post('/books')
                .send(newBookData);

            expect(res.statusCode).toBe(201);
            expect(res.body._id).toBe('new_book_id');
            expect(Book.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'New Book',
                author: 'Author Name',
                publishYear: 2023
                // owner check might be tricky if not strict
            }));
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/books')
                .send({ title: 'Missing Fields' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Send all required fields');
        });
    });

    describe('GET /books/:id', () => {
        it('should return a book by id', async () => {
            const mockBook = { _id: '123', title: 'Test Book' };
            Book.findById.mockResolvedValue(mockBook);

            const res = await request(app).get('/books/123');

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe('123');
            expect(Book.findById).toHaveBeenCalledWith('123');
        });
    });

    describe('PUT /books/:id', () => {
        it('should update a book', async () => {
            const updateData = {
                title: 'Updated Title',
                author: 'Updated Author',
                publishYear: 2024
            };

            Book.findByIdAndUpdate.mockResolvedValue(true);

            const res = await request(app)
                .put('/books/123')
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Book updated successfully!');
            expect(Book.findByIdAndUpdate).toHaveBeenCalledWith('123', updateData);
        });

        it('should return 404 if book not found', async () => {
            Book.findByIdAndUpdate.mockResolvedValue(null);

            const res = await request(app)
                .put('/books/123')
                .send({
                    title: 'Title',
                    author: 'Author',
                    publishYear: 2024
                });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /books/:id', () => {
        it('should delete a book', async () => {
            Book.findByIdAndDelete.mockResolvedValue(true);

            const res = await request(app).delete('/books/123');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Book deleted successfully!');
            expect(Book.findByIdAndDelete).toHaveBeenCalledWith('123');
        });

        it('should return 404 if book not found', async () => {
            Book.findByIdAndDelete.mockResolvedValue(null);

            const res = await request(app).delete('/books/123');

            expect(res.statusCode).toBe(404);
        });
    });
});
