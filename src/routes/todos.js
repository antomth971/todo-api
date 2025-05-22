// src/routes/todos.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/todoController');
const { idempotency } = require('../middleware/idempotency');
const Ajv = require('ajv');
const ajv = new Ajv();

// JSON Schema de validation
/**
 * @typedef {Object} Todo
 * @property {number} id - L'identifiant unique du todo
 * @property {string} title - Le titre du todo
 * @property {boolean} completed - L'état d'achèvement du todo
 */
const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    completed: { type: 'boolean' }
  },
  required: ['title'],
  additionalProperties: false
};
const validate = ajv.compile(schema);

// Middleware de validation pour POST et PUT
/**
 * Middleware de validation des données du todo
 * @param {Object} req - La requête HTTP
 * @param {Object} res - La réponse HTTP
 * @param {Function} next - La fonction middleware suivante
 */
function validateMiddleware(req, res, next) {
  const valid = validate(req.body);
  if (!valid) {
    return res.status(400).json({ errors: validate.errors });
  }
  next();
}

// Routes CRUD avec idempotence et validation sur création/mise à jour
/**
 * @module routes/todos
 * @requires express
 * @requires ../controllers/todoController
 */
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

router.post(
    '/',
    idempotency,
    validateMiddleware,
    ctrl.createTodo
);

router.put(
    '/:id',
    idempotency,
    validateMiddleware,
    ctrl.updateTodo
);

router.delete('/:id', ctrl.deleteTodo);

module.exports = router;
