import { Book } from '../models/bookModel.js';

export class RecommendationService {
  static async getRecommendations(user, limit = 10) {
    try {
      // Get user's favorite genres
      const favoriteGenres = user.preferences.favoriteGenres || [];
      
      // Get user's read books
      const readBooks = await Book.find({
        owner: user._id,
        readingStatus: 'Read'
      }).select('_id');
      
      const readBookIds = readBooks.map(book => book._id);
      
      // Build recommendation query
      const recommendationQuery = {
        _id: { $nin: readBookIds }, // Exclude read books
        owner: { $ne: user._id } // Exclude user's own books
      };
      
      // If user has favorite genres, prioritize them
      if (favoriteGenres.length > 0) {
        recommendationQuery.genres = { $in: favoriteGenres };
      }
      
      // Get recommendations based on genres and ratings
      const recommendations = await Book.aggregate([
        { $match: recommendationQuery },
        // Calculate recommendation score
        { $addFields: {
          score: {
            $add: [
              { $multiply: ['$averageRating', 2] }, // Weight ratings more heavily
              { $cond: [
                { $in: ['$genres', favoriteGenres] },
                3, // Bonus points for matching genres
                0
              ]}
            ]
          }
        }},
        // Sort by score
        { $sort: { score: -1 } },
        { $limit: limit }
      ]);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
  
  static async getPersonalizedRecommendations(user, limit = 10) {
    try {
      // Get user's reading history
      const userHistory = await Book.find({
        owner: user._id,
        readingStatus: 'Read'
      }).select('genres author');
      
      // Calculate genre preferences
      const genrePreferences = {};
      userHistory.forEach(book => {
        book.genres.forEach(genre => {
          genrePreferences[genre] = (genrePreferences[genre] || 0) + 1;
        });
      });
      
      // Calculate author preferences
      const authorPreferences = {};
      userHistory.forEach(book => {
        authorPreferences[book.author] = (authorPreferences[book.author] || 0) + 1;
      });
      
      // Get recommendations based on reading history
      const recommendations = await Book.aggregate([
        {
          $match: {
            owner: { $ne: user._id },
            _id: { $nin: userHistory.map(b => b._id) }
          }
        },
        // Calculate personalized score
        { $addFields: {
          score: {
            $add: [
              { $multiply: ['$averageRating', 1.5] }, // Base rating score
              { $sum: { // Genre match score
                $map: {
                  input: '$genres',
                  as: 'genre',
                  in: { $multiply: [
                    { $ifNull: [{ $arrayElemAt: [Object.values(genrePreferences), { $indexOfArray: [Object.keys(genrePreferences), '$$genre'] }] }, 0] },
                    2 // Genre weight
                  ]}
                }
              }},
              { $multiply: [ // Author match score
                { $ifNull: [{ $arrayElemAt: [Object.values(authorPreferences), { $indexOfArray: [Object.keys(authorPreferences), '$author'] }] }, 0] },
                3 // Author weight
              ]}
            ]
          }
        }},
        // Sort by personalized score
        { $sort: { score: -1 } },
        { $limit: limit }
      ]);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }
  
  static async getSimilarBooks(bookId, limit = 5) {
    try {
      const book = await Book.findById(bookId);
      if (!book) throw new Error('Book not found');
      
      // Find similar books based on genres and author
      const similarBooks = await Book.aggregate([
        {
          $match: {
            _id: { $ne: book._id },
            $or: [
              { genres: { $in: book.genres } },
              { author: book.author }
            ]
          }
        },
        // Calculate similarity score
        { $addFields: {
          score: {
            $add: [
              { $multiply: [
                { $size: { $setIntersection: ['$genres', book.genres] } },
                2 // Genre match weight
              ]},
              { $cond: [
                { $eq: ['$author', book.author] },
                3, // Author match bonus
                0
              ]},
              '$averageRating'
            ]
          }
        }},
        { $sort: { score: -1 } },
        { $limit: limit }
      ]);
      
      return similarBooks;
    } catch (error) {
      console.error('Error getting similar books:', error);
      throw error;
    }
  }
}
