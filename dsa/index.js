const search = require('./algorithms/search');
const sort = require('./algorithms/sort');
const ds = require('./data-structures');

module.exports = { ...search, ...sort, ...ds };
