import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publishYear: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    genres: [{
      type: String,
      enum: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 
             'Thriller', 'Romance', 'Horror', 'Biography', 'History', 'Science', 
             'Technology', 'Self-Help', 'Poetry', 'Drama', 'Children', 'Other'],
      trim: true,
    }],
    coverImage: {
      url: String,
      publicId: String
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    pageCount: {
      type: Number,
      min: 1
    },
    readingStatus: {
      type: String,
      enum: ['Want to Read', 'Currently Reading', 'Read'],
      default: 'Want to Read'
    },
    readingProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    estimatedReadingTime: {
      type: Number, // in minutes
      default: function() {
        return this.pageCount ? Math.round(this.pageCount * 1.5) : null;
      }
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    order: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Available', 'Borrowed', 'Reserved'],
      default: 'Available'
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genres: 1 });
bookSchema.index({ owner: 1, order: 1 });
bookSchema.index({ isbn: 1 });

// Virtual for book URL
bookSchema.virtual('url').get(function() {
  return `/books/${this._id}`;
});

// Pre-save middleware to update averageRating
bookSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
  next();
});

export const Book = mongoose.model("Book", bookSchema);
export default Book;
