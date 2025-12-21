const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'PosterShop API', version: '1.0.0', description: 'API for PosterShop backend' },
  servers: [{ url: 'http://localhost:4000' }],
  components: {
    securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'connect.sid' } },
    schemas: {
      User: { type: 'object', properties: { id: { type: 'integer' }, email: { type: 'string' }, name: { type: 'string' } } },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          price_cents: { type: 'integer' },
          image: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Review: { type: 'object', properties: { id: { type: 'integer' }, author: { type: 'string' }, body: { type: 'string' }, rating: { type: 'integer' }, created_at: { type: 'string' } } },
      CartItem: { type: 'object', properties: { product: { $ref: '#/components/schemas/Product' }, qty: { type: 'integer' } } },
      Cart: { type: 'object', properties: { cartId: { type: 'integer' }, items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } }, subtotal: { type: 'integer' } } },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } }, required: ['name', 'email', 'password'] },
              example: { name: 'New User', email: 'me@example.com', password: 'supersecret' },
            },
          },
        },
        responses: { '200': { description: 'Registered' } },
      },
    },

    '/auth/login': {
      post: {
        summary: 'Login with email/password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] },
              example: { email: 'me@example.com', password: 'supersecret' },
            },
          },
        },
        responses: { '200': { description: 'Logged in' } },
      },
    },

    '/auth/logout': { post: { summary: 'Logout', responses: { '200': { description: 'OK' } } } },

    '/api/me': { get: { summary: 'Current user', responses: { '200': { description: 'OK' } } } },

    '/api/products': { get: { summary: 'List products', responses: { '200': { description: 'OK' } } } },

    '/api/products/{productId}': { get: { summary: 'Get product', parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } } },

    '/api/reviews/{productId}': { get: { summary: 'Get reviews', parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } } },

    '/api/cart': { get: { summary: 'Get cart', security: [{ cookieAuth: [] }], responses: { '200': { description: 'OK' } } } },

    '/api/cart/items': {
      post: {
        summary: 'Add item',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { productId: { type: 'integer' }, qty: { type: 'integer' } }, required: ['productId'] },
              example: { productId: 1, qty: 2 },
            },
          },
        },
        responses: { '200': { description: 'Cart' } },
      },
      patch: {
        summary: 'Set qty',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { productId: { type: 'integer' }, qty: { type: 'integer' } }, required: ['productId', 'qty'] },
              example: { productId: 1, qty: 3 },
            },
          },
        },
        responses: { '200': { description: 'Cart' } },
      },
    },

    '/api/cart/items/{productId}': { delete: { summary: 'Remove item', security: [{ cookieAuth: [] }], parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Cart' } } } },

    '/api/cart/clear': { post: { summary: 'Clear cart', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Cart' } } } },

    '/api/checkout': {
      post: {
        summary: 'Checkout',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { shipping: { type: 'object', properties: { address: { type: 'string' } } } }, required: ['shipping'] },
              example: { shipping: { address: '123 Main St' } },
            },
          },
        },
        responses: { '200': { description: 'Order result' }, '400': { description: 'Invalid/Empty cart' } },
      },
    },
  },
};

export default swaggerDocument;
