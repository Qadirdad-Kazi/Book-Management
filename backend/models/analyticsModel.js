import mongoose from 'mongoose';

const systemMetricSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  cpu: {
    usage: Number,
    temperature: Number
  },
  memory: {
    total: Number,
    used: Number,
    free: Number
  },
  disk: {
    total: Number,
    used: Number,
    free: Number
  },
  requests: {
    total: Number,
    successful: Number,
    failed: Number
  }
});

const userMetricSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  activeUsers: Number,
  newUsers: Number,
  totalUsers: Number,
  averageSessionDuration: Number
});

const bookMetricSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  totalBooks: Number,
  booksAdded: Number,
  booksDeleted: Number,
  mostPopularGenres: [{
    genre: String,
    count: Number
  }],
  averageRating: Number,
  totalReviews: Number
});

const analyticsSchema = new mongoose.Schema({
  systemMetrics: [systemMetricSchema],
  userMetrics: [userMetricSchema],
  bookMetrics: [bookMetricSchema],
  errors: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    code: String,
    message: String,
    stack: String,
    endpoint: String,
    userId: mongoose.Schema.Types.ObjectId
  }],
  backups: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: String,
    size: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    },
    error: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ 'systemMetrics.timestamp': -1 });
analyticsSchema.index({ 'userMetrics.date': -1 });
analyticsSchema.index({ 'bookMetrics.date': -1 });
analyticsSchema.index({ 'errors.timestamp': -1 });
analyticsSchema.index({ 'backups.timestamp': -1 });

// Methods for analytics calculations
analyticsSchema.methods.calculateDailyMetrics = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const User = mongoose.model('User');
  const Book = mongoose.model('Book');
  
  // Calculate user metrics
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({
    createdAt: { $gte: today }
  });
  
  // Calculate book metrics
  const totalBooks = await Book.countDocuments();
  const booksAdded = await Book.countDocuments({
    createdAt: { $gte: today }
  });
  
  // Calculate genre distribution
  const genreDistribution = await Book.aggregate([
    { $unwind: '$genres' },
    { $group: { _id: '$genres', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  // Update metrics
  this.userMetrics.push({
    totalUsers,
    newUsers,
    activeUsers: Math.round(totalUsers * 0.1) // Estimate
  });
  
  this.bookMetrics.push({
    totalBooks,
    booksAdded,
    mostPopularGenres: genreDistribution.map(g => ({
      genre: g._id,
      count: g.count
    }))
  });
  
  await this.save();
};

export const Analytics = mongoose.model('Analytics', analyticsSchema);
