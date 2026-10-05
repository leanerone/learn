const API = {
  async _fetch(path, opts = {}) {
    const r = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || r.statusText);
    }
    return r.json();
  },
  // 用户
  listUsers: () => API._fetch('/api/users'),
  createUser: (data) => API._fetch('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  // 任务
  listTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return API._fetch('/api/tasks' + (qs ? '?' + qs : ''));
  },
  taskStats: () => API._fetch('/api/tasks/stats'),
  // 打卡
  listChecks: (userId) => API._fetch('/api/checks?user_id=' + userId),
  toggleCheck: (data) => API._fetch('/api/checks', { method: 'POST', body: JSON.stringify(data) }),
  uncheck: (userId, taskId) => API._fetch(`/api/checks/${userId}/${taskId}`, { method: 'DELETE' }),
  // 笔记
  listNotes: (userId) => API._fetch('/api/notes?user_id=' + userId),
  createNote: (data) => API._fetch('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id, data) => API._fetch('/api/notes/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id) => API._fetch('/api/notes/' + id, { method: 'DELETE' }),
  // 资源
  listResources: (category) => API._fetch('/api/resources' + (category ? '?category=' + category : '')),
  // 自检
  listQuiz: (category) => API._fetch('/api/quiz' + (category ? '?category=' + category : '')),
  answerQuiz: (data) => API._fetch('/api/quiz/answer', { method: 'POST', body: JSON.stringify(data) }),
  quizScore: (userId) => API._fetch('/api/quiz/score/' + userId),
  // 进度
  progress: (userId, day) => API._fetch('/api/progress/' + userId + (day ? '?day=' + day : ''))
};

// 当前用户(localStorage 记忆)
const Auth = {
  KEY: 'ai-platform-user',
  get() {
    try {
      const s = localStorage.getItem(this.KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  },
  set(u) { localStorage.setItem(this.KEY, JSON.stringify(u)); },
  clear() { localStorage.removeItem(this.KEY); }
};

// Toast
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 1800);
}

// 简易 escape HTML
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}