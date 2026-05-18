const getPagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

const paged = ({ rows, count }, page, limit) => ({
  rows,
  meta: {
    page,
    limit,
    total: count,
    pages: Math.ceil(count / limit)
  }
});

module.exports = { getPagination, paged };
