const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_FILE = path.join(DB_DIR, 'ai-platform.db');

let SQL = null;
let dbInstance = null;

function saveDb() {
  if (!dbInstance) return;
  const data = dbInstance.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

async function initDb() {
  SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    const buf = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(buf);
  } else {
    dbInstance = new SQL.Database();
  }
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT,
      avatar TEXT DEFAULT '🦊',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day INTEGER NOT NULL,
      week INTEGER NOT NULL,
      phase TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      steps TEXT NOT NULL,
      verification TEXT NOT NULL,
      deliverable TEXT,
      estimated_min INTEGER DEFAULT 30,
      difficulty TEXT DEFAULT 'medium',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_id INTEGER NOT NULL,
      status TEXT DEFAULT 'done',
      reflection TEXT,
      checked_at TEXT DEFAULT (datetime('now','localtime')),
      UNIQUE(user_id, task_id)
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      related_task_id INTEGER,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      url TEXT,
      description TEXT,
      duration INTEGER,
      language TEXT DEFAULT 'zh',
      tags TEXT
    );
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      answer INTEGER NOT NULL,
      explanation TEXT
    );
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      answered_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_checks_user ON checks(user_id);
    CREATE INDEX IF NOT EXISTS idx_checks_task ON checks(task_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_day ON tasks(day);
    CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
  `);
  saveDb();
  return dbInstance;
}

const db = {
  prepare(sql) {
    return {
      run(...args) {
        const stmt = dbInstance.prepare(sql);
        stmt.bind(args);
        stmt.step();
        stmt.free();
        saveDb();
        const lastIdRow = dbInstance.exec("SELECT last_insert_rowid() as id");
        return { lastInsertRowid: lastIdRow[0]?.values[0]?.[0] || 0 };
      },
      get(...args) {
        const stmt = dbInstance.prepare(sql);
        stmt.bind(args);
        const has = stmt.step();
        const row = has ? stmt.getAsObject() : null;
        stmt.free();
        return row;
      },
      all(...args) {
        const stmt = dbInstance.prepare(sql);
        if (args.length) stmt.bind(args);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      }
    };
  },
  exec(sql) {
    dbInstance.exec(sql);
    saveDb();
  },
  transaction(fn) {
    return (...args) => fn(...args);
  }
};

module.exports = db;
module.exports.initDb = initDb;