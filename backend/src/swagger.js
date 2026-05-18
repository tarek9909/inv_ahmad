module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Stock Driver System API',
    version: '1.0.0',
    description: 'Inventory, driver stock requests, purchase orders, payments, and reports.'
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': { post: { security: [], summary: 'Login', responses: { 200: { description: 'Login successful' } } } },
    '/auth/me': { get: { summary: 'Current user', responses: { 200: { description: 'Current user loaded' } } } },
    '/users': { get: { summary: 'List users' }, post: { summary: 'Create user' } },
    '/roles': { get: { summary: 'List roles' } },
    '/audit-logs': { get: { summary: 'List audit logs' } },
    '/categories': { get: { summary: 'List categories' }, post: { summary: 'Create category' } },
    '/suppliers': { get: { summary: 'List suppliers' }, post: { summary: 'Create supplier' } },
    '/items': { get: { summary: 'List items' }, post: { summary: 'Create item' } },
    '/items/low-stock': { get: { summary: 'List low stock items' } },
    '/stock-entries': { post: { summary: 'Add stock' } },
    '/stock-adjustments': { post: { summary: 'Adjust stock' } },
    '/stock-movements': { get: { summary: 'List stock movements' } },
    '/purchase-orders': { get: { summary: 'List purchase orders' }, post: { summary: 'Create purchase order' } },
    '/drivers': { get: { summary: 'List drivers' }, post: { summary: 'Create driver' } },
    '/stock-requests': { get: { summary: 'List stock requests' }, post: { summary: 'Create stock request' } },
    '/payments': { get: { summary: 'List payments' }, post: { summary: 'Create payment' } },
    '/reports/dashboard': { get: { summary: 'Dashboard report' } }
  }
};
