import express from 'express';
import { Book } from "../models/bookModel.js";
import { auth } from '../middleware/auth.js';
import LibraryService from '../services/libraryService.js';

const router = express.Router();

// Route for save a new book
router.post("/", auth, async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: "Send all required fields: title, author, publishYear",
      });
    }

    const newBook = {
      title: request.body.title.trim(),
      author: request.body.author.trim(),
      publishYear: parseInt(request.body.publishYear),
      owner: request.user._id,
      status: 'Available' // Set default status explicitly
    };

    console.log('Attempting to create book:', newBook);
    const book = await Book.create(newBook);
    console.log('Book created successfully:', book);

    return response.status(201).send(book);
  } catch (error) {
    console.error('Error creating book:', error);
    response.status(500).send({ message: error.message });
  }
});

// Route for get all books from db
router.get("/", auth, async (request, response) => {
  try {
    const { search } = request.query;
    let books;

    if (search) {
      books = await LibraryService.searchBooks(search);
    } else {
      books = await Book.find({});
    }

    return response.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    response.status(500).send({ message: error.message });
  }
});

// Route for get books from db by id
router.get("/:id", auth, async (request, response) => {
  try {
    const { id } = request.params;
    const book = await Book.findById(id);
    return response.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book by id:', error);
    response.status(500).send({ message: error.message });
  }
});

// Route for update a book
router.put("/:id", auth, async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Book.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: "Book not found!" });
    }
    return response.status(200).json({ message: "Book updated successfully!" });
  } catch (error) {
    console.error('Error updating book:', error);
    response.status(500).send({ message: error.message });
  }
});

// Route to Borrow a book
router.put("/borrow/:id", auth, async (request, response) => {
  try {
    const { id } = request.params;
    const book = await LibraryService.borrowBook(id);
    return response.status(200).json({ message: "Book borrowed successfully", book });
  } catch (error) {
    console.error('Error borrowing book:', error);
    response.status(400).send({ message: error.message });
  }
});

// Route to Return a book
router.put("/return/:id", auth, async (request, response) => {
  try {
    const { id } = request.params;
    const book = await LibraryService.returnBook(id);
    // In a real app, calculate fine here if needed

    return response.status(200).json({ message: "Book returned successfully", book });
  } catch (error) {
    console.error('Error returning book:', error);
    response.status(400).send({ message: error.message });
  }
});

// Route for delete a book
router.delete("/:id", auth, async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: "Book not found!" });
    }
    return response.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    console.error('Error deleting book:', error);
    response.status(500).send({ message: error.message });
  }
});

export default router;
