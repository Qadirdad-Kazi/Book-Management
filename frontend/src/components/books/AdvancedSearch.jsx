import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { debounce } from 'lodash';
import { getApiUrl } from '../../config/api';

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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(
        getApiUrl('/api/search/suggest'),
        {
          params: { query },
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions({ titles: [], authors: [] });
    }
  }, 300);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(
        getApiUrl('/api/books/search'),
        {
          params: searchParams,
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      onSearch(response.data);
    } catch (error) {
      console.error('Search error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Search failed', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
    if (name === 'query') {
      getSuggestions(value);
    }
  };

  const handleGenreChange = (genre) => {
    setSearchParams(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      query: '',
      genres: [],
      minRating: 0,
      maxRating: 5,
      startYear: '',
      endYear: '',
      sortBy: 'relevance'
    });
    setSuggestions({ titles: [], authors: [] });
  };

  useEffect(() => {
    // Initial search when component mounts
    handleSearch();
  }, []);

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              name="query"
              value={searchParams.query}
              onChange={handleInputChange}
              placeholder="Search books..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FiFilter className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <FiSearch className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>

        {showFilters && (
          <div className="p-4 bg-white rounded-lg shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Advanced Filters</h3>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Genres</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {genreOptions.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreChange(genre)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        searchParams.genres.includes(genre)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Year</label>
                  <input
                    type="number"
                    name="startYear"
                    value={searchParams.startYear}
                    onChange={handleInputChange}
                    placeholder="From year"
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Year</label>
                  <input
                    type="number"
                    name="endYear"
                    value={searchParams.endYear}
                    onChange={handleInputChange}
                    placeholder="To year"
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  name="sortBy"
                  value={searchParams.sortBy}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Clear All
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedSearch;
