import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

class SearchService {
  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      }
    });
    this.indexName = 'books';
  }

  async initialize() {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.indexName
      });

      if (!indexExists) {
        await this.createIndex();
      }
    } catch (error) {
      console.error('Error initializing search service:', error);
      throw error;
    }
  }

  async createIndex() {
    try {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            analysis: {
              analyzer: {
                custom_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball']
                }
              }
            }
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'custom_analyzer',
                boost: 2.0
              },
              author: {
                type: 'text',
                analyzer: 'custom_analyzer',
                boost: 1.5
              },
              description: {
                type: 'text',
                analyzer: 'custom_analyzer'
              },
              genres: {
                type: 'keyword'
              },
              isbn: {
                type: 'keyword'
              },
              publishYear: {
                type: 'integer'
              },
              averageRating: {
                type: 'float'
              },
              totalReviews: {
                type: 'integer'
              },
              owner: {
                type: 'keyword'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating search index:', error);
      throw error;
    }
  }

  async indexBook(book) {
    try {
      await this.client.index({
        index: this.indexName,
        id: book._id.toString(),
        body: {
          title: book.title,
          author: book.author,
          description: book.description,
          genres: book.genres,
          isbn: book.isbn,
          publishYear: book.publishYear,
          averageRating: book.averageRating,
          totalReviews: book.totalReviews,
          owner: book.owner.toString()
        }
      });
    } catch (error) {
      console.error('Error indexing book:', error);
      throw error;
    }
  }

  async updateBook(bookId, updates) {
    try {
      await this.client.update({
        index: this.indexName,
        id: bookId.toString(),
        body: {
          doc: updates
        }
      });
    } catch (error) {
      console.error('Error updating book in search index:', error);
      throw error;
    }
  }

  async deleteBook(bookId) {
    try {
      await this.client.delete({
        index: this.indexName,
        id: bookId.toString()
      });
    } catch (error) {
      console.error('Error deleting book from search index:', error);
      throw error;
    }
  }

  async search({
    query,
    genres = [],
    minRating = 0,
    maxRating = 5,
    startYear,
    endYear,
    owner,
    page = 1,
    limit = 10,
    sortBy = 'relevance'
  }) {
    try {
      const must = [];
      const filter = [];

      // Full-text search across multiple fields
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['title^2', 'author^1.5', 'description'],
            fuzziness: 'AUTO'
          }
        });
      }

      // Genre filter
      if (genres.length > 0) {
        filter.push({
          terms: { genres }
        });
      }

      // Rating filter
      filter.push({
        range: {
          averageRating: {
            gte: minRating,
            lte: maxRating
          }
        }
      });

      // Year range filter
      if (startYear || endYear) {
        filter.push({
          range: {
            publishYear: {
              ...(startYear && { gte: startYear }),
              ...(endYear && { lte: endYear })
            }
          }
        });
      }

      // Owner filter
      if (owner) {
        filter.push({
          term: { owner }
        });
      }

      // Sorting
      let sort = [];
      switch (sortBy) {
        case 'rating':
          sort = [{ averageRating: 'desc' }];
          break;
        case 'year':
          sort = [{ publishYear: 'desc' }];
          break;
        case 'reviews':
          sort = [{ totalReviews: 'desc' }];
          break;
        default:
          sort = ['_score']; // Default to relevance
      }

      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must,
              filter
            }
          },
          sort,
          from: (page - 1) * limit,
          size: limit
        }
      });

      return {
        total: response.hits.total.value,
        books: response.hits.hits.map(hit => ({
          id: hit._id,
          ...hit._source,
          score: hit._score
        })),
        page,
        totalPages: Math.ceil(response.hits.total.value / limit)
      };
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  async suggest(query, limit = 5) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          suggest: {
            title_suggest: {
              prefix: query,
              completion: {
                field: 'title',
                size: limit
              }
            },
            author_suggest: {
              prefix: query,
              completion: {
                field: 'author',
                size: limit
              }
            }
          }
        }
      });

      return {
        titles: response.suggest.title_suggest[0].options.map(option => option.text),
        authors: response.suggest.author_suggest[0].options.map(option => option.text)
      };
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }
}

export const searchService = new SearchService();
