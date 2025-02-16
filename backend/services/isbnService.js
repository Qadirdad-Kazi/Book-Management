import axios from 'axios';

export class ISBNService {
  static GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

  static async lookupISBN(isbn) {
    try {
      const response = await axios.get(\`\${this.GOOGLE_BOOKS_API}?q=isbn:\${isbn}\`);
      
      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Book not found');
      }

      const bookData = response.data.items[0].volumeInfo;

      return {
        title: bookData.title,
        author: bookData.authors ? bookData.authors[0] : 'Unknown',
        publishYear: bookData.publishedDate ? new Date(bookData.publishedDate).getFullYear() : null,
        description: bookData.description || '',
        pageCount: bookData.pageCount,
        genres: bookData.categories || [],
        coverImage: bookData.imageLinks ? {
          url: bookData.imageLinks.thumbnail.replace('http:', 'https:'),
          publicId: null
        } : null,
        isbn: isbn,
        averageRating: bookData.averageRating || 0,
        totalReviews: bookData.ratingsCount || 0
      };
    } catch (error) {
      console.error('Error looking up ISBN:', error);
      throw error;
    }
  }

  static async searchBooks(query, limit = 10) {
    try {
      const response = await axios.get(\`\${this.GOOGLE_BOOKS_API}?q=\${encodeURIComponent(query)}&maxResults=\${limit}\`);
      
      if (!response.data.items) {
        return [];
      }

      return response.data.items.map(item => {
        const bookData = item.volumeInfo;
        return {
          title: bookData.title,
          author: bookData.authors ? bookData.authors[0] : 'Unknown',
          publishYear: bookData.publishedDate ? new Date(bookData.publishedDate).getFullYear() : null,
          description: bookData.description || '',
          pageCount: bookData.pageCount,
          genres: bookData.categories || [],
          coverImage: bookData.imageLinks ? {
            url: bookData.imageLinks.thumbnail.replace('http:', 'https:'),
            publicId: null
          } : null,
          isbn: bookData.industryIdentifiers ? 
            bookData.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
            bookData.industryIdentifiers[0]?.identifier : null,
          averageRating: bookData.averageRating || 0,
          totalReviews: bookData.ratingsCount || 0
        };
      });
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  static validateISBN(isbn) {
    // Remove hyphens and spaces
    isbn = isbn.replace(/[-\s]/g, '');

    // Check for ISBN-13
    if (isbn.length === 13) {
      return this.validateISBN13(isbn);
    }
    // Check for ISBN-10
    else if (isbn.length === 10) {
      return this.validateISBN10(isbn);
    }

    return false;
  }

  static validateISBN10(isbn) {
    let sum = 0;
    
    // Calculate checksum for ISBN-10
    for (let i = 0; i < 9; i++) {
      sum += (10 - i) * parseInt(isbn[i]);
    }
    
    // Check digit can be 'X' (representing 10)
    const lastChar = isbn[9].toUpperCase();
    const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
    
    sum += checkDigit;
    
    return sum % 11 === 0;
  }

  static validateISBN13(isbn) {
    let sum = 0;
    
    // Calculate checksum for ISBN-13
    for (let i = 0; i < 12; i++) {
      sum += (i % 2 === 0 ? 1 : 3) * parseInt(isbn[i]);
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return checkDigit === parseInt(isbn[12]);
  }

  static convertISBN10to13(isbn10) {
    if (!this.validateISBN10(isbn10)) {
      throw new Error('Invalid ISBN-10');
    }

    // Remove any hyphens and spaces
    isbn10 = isbn10.replace(/[-\s]/g, '');

    // Add prefix '978' and remove ISBN-10 check digit
    let isbn13 = '978' + isbn10.slice(0, -1);

    // Calculate ISBN-13 check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += (i % 2 === 0 ? 1 : 3) * parseInt(isbn13[i]);
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    return isbn13 + checkDigit;
  }
}
