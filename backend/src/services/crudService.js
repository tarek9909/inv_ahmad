const { Op } = require('sequelize');
const { getPagination, paged } = require('../utils/pagination');
const HttpError = require('../utils/httpError');

const buildSearch = (fields, search) => {
  if (!search || !fields.length) return {};
  return { [Op.or]: fields.map((field) => ({ [field]: { [Op.like]: `%${search}%` } })) };
};

const list = async (Model, query, options = {}) => {
  const { page, limit, offset } = getPagination(query);
  const result = await Model.findAndCountAll({
    where: buildSearch(options.searchFields || [], query.search),
    include: options.include || [],
    order: options.order || [['id', 'DESC']],
    limit,
    offset,
    distinct: true
  });
  return paged(result, page, limit);
};

const findOrFail = async (Model, id, options = {}) => {
  const row = await Model.findByPk(id, { include: options.include || [] });
  if (!row) throw new HttpError(404, `${options.name || 'Record'} not found`);
  return row;
};

module.exports = { list, findOrFail };
