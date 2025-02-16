import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { debounce } from 'lodash';

const AdvancedSearch = ({ onSearch, className }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    genres: [],
    minRating: 0,
    maxRating: 5,
    startYear: '',
    endYear: '',
    sortBy: 'relevance'
  });
  const [suggestions, setSuggestions] = useState({ titles: [], authors: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const genreOptions = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
    'Thriller', 'Romance', 'Horror', 'Biography', 'History', 'Science',
    'Technology', 'Self-Help', 'Poetry', 'Drama', 'Children'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'year', label: 'Publication Year (New to Old)' },
    { value: 'reviews', label: 'Most Reviewed' }
  ];

  // Debounced function for getting search suggestions
  const getSuggestions = debounce(async (query) => {
    if (!query) {
      setSuggestions({ titles: [], authors: [] });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5555/api/search/suggest?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, 300);

  useEffect(() => {
    getSuggestions(searchParams.query);
    return () => getSuggestions.cancel();
  }, [searchParams.query]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5555/api/search/books',
        {
          params: {
            ...searchParams,
            genres: JSON.stringify(searchParams.genres)
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      onSearch(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
      enqueueSnackbar('Error searching books', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genre) => {
    setSearchParams(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      query: searchParams.query,
      genres: [],
      minRating: 0,
      maxRating: 5,
      startYear: '',
      endYear: '',
      sortBy: 'relevance'
    });
  };

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchParams.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            placeholder="Search books by title, author, or description..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {suggestions.titles.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {suggestions.titles.map((title, index) => (
                <button
                  key={index}
                  onClick={() => handleInputChange('query', title)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FiFilter className="w-5 h-5" />
        </button>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <FiSearch className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all
            </button>
          </div>

          {/* Genres */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    searchParams.genres.includes(genre)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Range */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Rating Range</h4>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={searchParams.minRating}
                onChange={(e) => handleInputChange('minRating', e.target.value)}
                className="w-20 px-2 py-1 border rounded"
              />
              <span>to</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={searchParams.maxRating}
                onChange={(e) => handleInputChange('maxRating', e.target.value)}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
          </div>

          {/* Year Range */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Publication Year</h4>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="From"
                value={searchParams.startYear}
                onChange={(e) => handleInputChange('startYear', e.target.value)}
                className="w-24 px-2 py-1 border rounded"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="To"
                value={searchParams.endYear}
                onChange={(e) => handleInputChange('endYear', e.target.value)}
                className="w-24 px-2 py-1 border rounded"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h4 className="text-sm font-medium mb-2">Sort By</h4>
            <select
              value={searchParams.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="w-full px-2 py-1 border rounded"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
