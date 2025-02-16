import express from 'express';
import { ISBNService } from '../services/isbnService.js';
import { searchService } from '../services/searchService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Lookup book by ISBN
router.get('/isbn/:isbn', authenticateToken, async (req, res) => {
  try {
    const { isbn } = req.params;

    // Validate ISBN
    if (!ISBNService.validateISBN(isbn)) {
      return res.status(400).json({ message: 'Invalid ISBN format' });
    }

    const bookData = await ISBNService.lookupISBN(isbn);
    res.json(bookData);
  } catch (error) {
    console.error('Error looking up ISBN:', error);
    res.status(error.message === 'Book not found' ? 404 : 500)
       .json({ message: error.message || 'Error looking up ISBN' });
  }
});

// Search books
router.get('/books', authenticateToken, async (req, res) => {
  try {
    const {
      query,
      genres,
      minRating,
      maxRating,
      startYear,
      endYear,
      page,
      limit,
      sortBy
    } = req.query;

    // Parse array parameters
    const parsedGenres = genres ? JSON.parse(genres) : [];

    const searchResults = await searchService.search({
      query,
      genres: parsedGenres,
      minRating: parseFloat(minRating) || 0,
      maxRating: parseFloat(maxRating) || 5,
      startYear: parseInt(startYear),
      endYear: parseInt(endYear),
      owner: req.query.includeOwn ? req.user._id : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortBy
    });

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Error searching books' });
  }
});

// Get search suggestions
router.get('/suggest', authenticateToken, async (req, res) => {
  try {
    const { query, limit } = req.query;
    const suggestions = await searchService.suggest(query, parseInt(limit) || 5);
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ message: 'Error getting suggestions' });
  }
});

// Search books by title/author
router.get('/books/search', authenticateToken, async (req, res) => {
  try {
    const { query, limit } = req.query;
    const books = await ISBNService.searchBooks(query, parseInt(limit) || 10);
    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Error searching books' });
  }
});

// Validate ISBN
router.post('/isbn/validate', authenticateToken, (req, res) => {
  try {
    const { isbn } = req.body;
    const isValid = ISBNService.validateISBN(isbn);
    res.json({ isValid });
  } catch (error) {
    console.error('Error validating ISBN:', error);
    res.status(500).json({ message: 'Error validating ISBN' });
  }
});

// Convert ISBN-10 to ISBN-13
router.post('/isbn/convert', authenticateToken, (req, res) => {
  try {
    const { isbn } = req.body;
    const isbn13 = ISBNService.convertISBN10to13(isbn);
    res.json({ isbn13 });
  } catch (error) {
    console.error('Error converting ISBN:', error);
    res.status(400).json({ message: error.message || 'Error converting ISBN' });
  }
});

export default router;
