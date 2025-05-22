const db = require('../db');

/**
 * Gets all todos
 * @returns {Promise<Array>} - The list of todos
 * @throws {Error} - If an error occurs while fetching todos
 * */
function getAll() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, title, completed FROM todos', (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => ({
        id: r.id,
        title: r.title,
        completed: Boolean(r.completed)
      })));
    });
  });
}

/**
 * Gets a todo by ID
 * @param {number} id - The ID of the todo
 * @returns {Promise<Object|null>} - The todo object or null if not found
 * @throws {Error} - If an error occurs while fetching the todo
 * */

function get(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, title, completed FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else if (!row) resolve(null);
      else resolve({
        id: row.id,
        title: row.title,
        completed: Boolean(row.completed)
      });
    });
  });
}

/**
 * Creates a new todo
 * @param {Object} data - The todo data
 * @param {string} data.title - The title of the todo
 * @returns {Promise<Object>} - The created todo object
 * @throws {Error} - If an error occurs while creating the todo
 * */

function create(data) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO todos(title, completed) VALUES(?, 0)',
      [data.title],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, title: data.title, completed: false });
      }
    );
  });
}

/**
 *  Updates a todo by ID
 * @param {number} id - The ID of the todo
 * @param {Object} data - The todo data
 * @returns {Promise<Object|null>} - The updated todo object or null if not found
 * @throws {Error} - If an error occurs while updating the todo
 * */

function update(id, data) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE todos SET title = COALESCE(?, title), completed = COALESCE(?, completed) WHERE id = ?',
      [data.title, data.completed ? 1 : 0, id],
      function(err) {
        if (err) return reject(err);
        if (this.changes === 0) return resolve(null);
        get(id).then(resolve).catch(reject);
      }
    );
  });
}

/**
 * Deletes a todo by ID
 * @param {number} id - The ID of the todo
 * @returns {Promise<void>} - Resolves when the todo is deleted
 * @throws {Error} - If an error occurs while deleting the todo
 * */

function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { getAll, get, create, update, remove };