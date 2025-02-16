import React, { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FiSearch, FiLoader } from 'react-icons/fi';

const ISBNLookup = ({ onBookFound, className }) => {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleISBNChange = (event) => {
    // Remove any non-digit characters except 'X'
    const cleaned = event.target.value.replace(/[^0-9X]/g, '');
    setIsbn(cleaned);
  };

  const validateISBN = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5555/api/search/isbn/validate',
        { isbn },
        {
          headers: {
            Authorization: \`Bearer \${localStorage.getItem('token')}\`
          }
        }
      );
      return response.data.isValid;
    } catch (error) {
      console.error('Error validating ISBN:', error);
      return false;
    }
  };

  const handleLookup = async () => {
    if (!isbn) {
      enqueueSnackbar('Please enter an ISBN', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);

      // Validate ISBN format
      const isValid = await validateISBN();
      if (!isValid) {
        enqueueSnackbar('Invalid ISBN format', { variant: 'error' });
        return;
      }

      // Lookup book details
      const response = await axios.get(
        \`http://localhost:5555/api/search/isbn/\${isbn}\`,
        {
          headers: {
            Authorization: \`Bearer \${localStorage.getItem('token')}\`
          }
        }
      );

      onBookFound(response.data);
      enqueueSnackbar('Book details found!', { variant: 'success' });
    } catch (error) {
      console.error('Error looking up ISBN:', error);
      if (error.response?.status === 404) {
        enqueueSnackbar('Book not found', { variant: 'warning' });
      } else {
        enqueueSnackbar('Error looking up ISBN', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    // Clean pasted text
    const cleaned = event.clipboardData.getData('text').replace(/[^0-9X]/g, '');
    setIsbn(cleaned);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={isbn}
            onChange={handleISBNChange}
            onPaste={handlePaste}
            onKeyPress={handleKeyPress}
            placeholder="Enter ISBN (10 or 13 digits)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength="13"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={handleLookup}
          disabled={loading || !isbn}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSearch className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Tip: You can find the ISBN on the back cover or copyright page of the book
      </p>
    </div>
  );
};

export default ISBNLookup;
