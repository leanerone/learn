const db = require('./db');
const path = require('path');

let tasks = [];

function loadTasks() {
  tasks = require('./seed-tasks');
}

module.exports = { loadTasks, get tasks() { return tasks; } };