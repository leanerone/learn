const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 静态文件(前端 SPA)
app.use(express.static(path.join(__dirname, '..', 'client')));

(async () => {
  const db = require('./db');
  await db.initDb();
  const seedTasks = require('./seed-tasks');
  const seedMeta = require('./seed-meta');
  await seedTasks.ready;
  await seedMeta.ready;
  console.log('✓ 数据库初始化完成');

// ========== API ==========

// --- Users ---
app.get('/api/users', (req, res) => {
  const db = require('./db');
  const users = db.prepare('SELECT * FROM users ORDER BY id').all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const db = require('./db');
  const { username, display_name, avatar } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });
  try {
    const r = db.prepare('INSERT INTO users (username, display_name, avatar) VALUES (?, ?, ?)').run(username, display_name || username, avatar || '🦊');
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Tasks ---
app.get('/api/tasks', (req, res) => {
  const db = require('./db');
  const { day, week, category } = req.query;
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];
  if (day) { sql += ' AND day = ?'; params.push(parseInt(day)); }
  if (week) { sql += ' AND week = ?'; params.push(parseInt(week)); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY day';
  const tasks = db.prepare(sql).all(...params);
  tasks.forEach(t => { t.steps = JSON.parse(t.steps); });
  res.json(tasks);
});

app.get('/api/tasks/stats', (req, res) => {
  const db = require('./db');
  const total = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
  const byWeek = db.prepare(`SELECT week, COUNT(*) as total FROM tasks GROUP BY week ORDER BY week`).all();
  const byCategory = db.prepare(`SELECT category, COUNT(*) as total FROM tasks GROUP BY category ORDER BY total DESC`).all();
  res.json({ total, byWeek, byCategory });
});

// --- Check(打卡) ---
app.get('/api/checks', (req, res) => {
  const db = require('./db');
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  const checks = db.prepare('SELECT * FROM checks WHERE user_id = ?').all(user_id);
  res.json(checks);
});

app.post('/api/checks', (req, res) => {
  const db = require('./db');
  const { user_id, task_id, status, reflection } = req.body;
  if (!user_id || !task_id) return res.status(400).json({ error: 'user_id & task_id required' });
  try {
    const r = db.prepare(`INSERT INTO checks (user_id, task_id, status, reflection) VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, task_id) DO UPDATE SET status=excluded.status, reflection=excluded.reflection, checked_at=datetime('now','localtime')`).run(user_id, task_id, status || 'done', reflection || '');
    res.json({ ok: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/checks/:user_id/:task_id', (req, res) => {
  const db = require('./db');
  db.prepare('DELETE FROM checks WHERE user_id = ? AND task_id = ?').run(req.params.user_id, req.params.task_id);
  res.json({ ok: true });
});

// --- Notes ---
app.get('/api/notes', (req, res) => {
  const db = require('./db');
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC').all(user_id);
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const db = require('./db');
  const { user_id, title, content, tags, related_task_id } = req.body;
  if (!user_id || !title) return res.status(400).json({ error: 'user_id & title required' });
  const r = db.prepare('INSERT INTO notes (user_id, title, content, tags, related_task_id) VALUES (?, ?, ?, ?, ?)').run(user_id, title, content || '', tags || '', related_task_id || null);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/notes/:id', (req, res) => {
  const db = require('./db');
  const { title, content, tags } = req.body;
  db.prepare(`UPDATE notes SET title=?, content=?, tags=?, updated_at=datetime('now','localtime') WHERE id=?`).run(title, content, tags, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/notes/:id', (req, res) => {
  const db = require('./db');
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Resources ---
app.get('/api/resources', (req, res) => {
  const db = require('./db');
  const { category } = req.query;
  let sql = 'SELECT * FROM resources WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY category, id';
  const rows = db.prepare(sql).all(...params);
  rows.forEach(r => { if (r.tags) try { r.tags = JSON.parse(r.tags); } catch (e) {} });
  res.json(rows);
});

// --- Quiz ---
app.get('/api/quiz', (req, res) => {
  const db = require('./db');
  const { category } = req.query;
  let sql = 'SELECT id, category, question, options FROM quiz_questions WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY RANDOM()';
  const rows = db.prepare(sql).all(...params);
  rows.forEach(r => { r.options = JSON.parse(r.options); });
  res.json(rows);
});

app.post('/api/quiz/answer', (req, res) => {
  const db = require('./db');
  const { user_id, question_id, answer } = req.body;
  const q = db.prepare('SELECT answer, explanation FROM quiz_questions WHERE id = ?').get(question_id);
  if (!q) return res.status(404).json({ error: 'question not found' });
  const correct = parseInt(answer) === q.answer ? 1 : 0;
  db.prepare('INSERT INTO quiz_attempts (user_id, question_id, correct) VALUES (?, ?, ?)').run(user_id, question_id, correct);
  res.json({ correct, explanation: q.explanation, right_answer: q.answer });
});

app.get('/api/quiz/score/:user_id', (req, res) => {
  const db = require('./db');
  const s = db.prepare(`SELECT
    COUNT(*) as total,
    SUM(correct) as right_count
    FROM quiz_attempts WHERE user_id = ?`).get(req.params.user_id);
  res.json({
    total: s.total,
    right: s.right_count || 0,
    accuracy: s.total > 0 ? Math.round((s.right_count || 0) / s.total * 100) : 0
  });
});

// --- 进度总览 ---
app.get('/api/progress/:user_id', (req, res) => {
  const db = require('./db');
  const userId = req.params.user_id;
  const totalTasks = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
  const doneTasks = db.prepare('SELECT COUNT(DISTINCT task_id) as c FROM checks WHERE user_id = ?').get(userId).c;
  const byWeek = db.prepare(`
    SELECT t.week, COUNT(t.id) as total,
      SUM(CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END) as done
    FROM tasks t LEFT JOIN checks c ON c.task_id = t.id AND c.user_id = ?
    GROUP BY t.week ORDER BY t.week`).all(userId);
  const today = new Date();
  const startDate = new Date('2026-10-02');
  let dayDiff = Math.floor((today - startDate) / (1000*60*60*24)) + 1;
  if (dayDiff < 1) dayDiff = 1;
  // 支持 ?day=N 强制查看指定天
  if (req.query.day) dayDiff = parseInt(req.query.day);
  const todayTask = db.prepare('SELECT * FROM tasks WHERE day = ?').get(dayDiff);
  res.json({
    total: totalTasks,
    done: doneTasks,
    percent: totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0,
    byWeek,
    currentDay: Math.min(dayDiff, totalTasks),
    todayTask: todayTask ? { ...todayTask, steps: JSON.parse(todayTask.steps) } : null
  });
});

// 404
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API not found' });
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 AI 学习平台启动: http://localhost:${PORT}`);
  console.log(`📚 课程页面:        http://localhost:${PORT}/`);
  console.log(`🔧 API 接口:        http://localhost:${PORT}/api/\n`);
});
})();