import { Book } from '../models/bookModel.js';

class LibraryService {
    /**
     * Search for books by query string
     * @param {string} query 
     * @returns {Promise<Array>}
     */
    async searchBooks(query) {
        if (!query) return [];
        const regex = new RegExp(query, 'i');
        return await Book.find({
            $or: [
                { title: { $regex: regex } },
                { author: { $regex: regex } }
            ]
        });
    }

    /**
     * Borrow a book if available
     * @param {string} bookId 
     * @returns {Promise<Object>}
     */
    async borrowBook(bookId) {
        const book = await Book.findById(bookId);
        if (!book) throw new Error("Book not found");

        if (book.status === 'Borrowed') {
            throw new Error("Book is already borrowed");
        }

        book.status = 'Borrowed';
        // In a real app we would set a dueDate here
        book.lastUpdated = new Date();
        return await book.save();
    }

    /**
     * Return a borrowed book
     * @param {string} bookId 
     * @returns {Promise<Object>}
     */
    async returnBook(bookId) {
        const book = await Book.findById(bookId);
        if (!book) throw new Error("Book not found");

        if (book.status !== 'Borrowed') {
            // It's already returned or never was borrowed, but for idempotency we can just set it
            // or throw error depending on requirements. Requirement says "Return borrowed book".
            book.status = 'Available';
        } else {
            book.status = 'Available';
        }

        book.lastUpdated = new Date();
        return await book.save();
    }

    /**
     * Calculate fine for late return
     * @param {Date} dueDate 
     * @param {Date} returnDate 
     * @returns {number} Fine amount (10 per day)
     */
    calculateFine(dueDate, returnDate) {
        const due = new Date(dueDate);
        const returned = new Date(returnDate);

        // Normalize to start of day
        due.setHours(0, 0, 0, 0);
        returned.setHours(0, 0, 0, 0);

        const diffTime = returned - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 0;

        return diffDays * 10; // Fine is 10 units per day
    }
}

export default new LibraryService();
