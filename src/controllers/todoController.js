// src/controllers/todoController.js
const model = require('../models/todo');
const { enqueueTodo } = require('../queue');

/**
 * Gets all todos
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - The list of todos
 * @throws {Error} - If an error occurs while fetching todos
 */
async function list(req, res) {
  const todos = await model.getAll();
  return res.json(todos);
}

/**
 * Gets a todo by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The todo object
 * @throws {Error} - If the todo is not found
 */
async function get(req, res) {
  const id = parseInt(req.params.id, 10);
  const todo = await model.get(id);
  if (!todo) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.json(todo);
}

/**
 * Creates a new todo
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The created todo object
 * @throws {Error} - If an error occurs while creating the todo
 */
async function createTodo(req, res) {
  // Création en base
  const todo = await model.create(req.body);
  // Enqueue du job (traité par worker séparé)
  try {
    await enqueueTodo(todo);
  } catch (err) {
    console.error('Enqueue Todo failed:', err);
  }
  return res.status(201).json(todo);
}

/**
 * Updates a todo by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated todo object
 * @throws {Error} - If the todo is not found
 */
async function updateTodo(req, res) {
  const id = parseInt(req.params.id, 10);
  const updated = await model.update(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.json(updated);
}

/**
 * Deletes a todo by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {void} - No content
 * @throws {Error} - If the todo is not found
 */
async function deleteTodo(req, res) {
  const id = parseInt(req.params.id, 10);
  await model.remove(id);
  return res.status(204).send();
}

module.exports = {
  list,
  get,
  createTodo,
  updateTodo,
  deleteTodo,
};
