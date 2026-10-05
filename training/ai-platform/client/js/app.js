// ========== AI 学习平台 · 路由 + 主应用 ==========

const App = {
  routes: {
    dashboard: Pages.dashboard,
    today: Pages.today,
    course: Pages.course,
    slides: Slides.listView,
    skills: Pages.skills,
    progress: Pages.progress,
    resources: Pages.resources,
    notes: Pages.notes,
    quiz: Pages.quiz
  },

  // 演示模式状态
  presentation: { active: false, idx: 0, total: 0 },

  // 启动入口
  async init() {
    this.checkAuth();
    this.bindTopbar();
    window.addEventListener('hashchange', () => this.render());
    await this.render();
    this.bindGlobalEvents();
  },

  // 检查登录状态
  checkAuth() {
    let u = Auth.get();
    // 兜底:localStorage 残留无 id 的对象时清掉,强制重新登录
    if (u && !u.id) {
      console.warn('[Auth] 旧用户数据无 id,清掉', u);
      Auth.clear();
      u = null;
    }
    if (!u) {
      document.getElementById('loginModal').classList.remove('hidden');
      this.bindLogin();
    } else {
      this.updateBadge(u);
    }
  },

  updateBadge(u) {
    const el = document.getElementById('userBadge');
    el.textContent = `${u.avatar || '🦊'} ${u.display_name || u.username} ▼`;
    el.title = '点击切换/退出用户';
    el.onclick = () => this.switchUser();
  },

  bindLogin() {
    const btn = document.getElementById('loginBtn');
    btn.onclick = async () => {
      const username = document.getElementById('loginName').value.trim();
      const avatar = document.getElementById('loginAvatar').value;
      if (!username) return toast('请输入名字', 'error');
      try {
        let user;
        try {
          const users = await API.listUsers();
          user = users.find(u => u.username === username);
        } catch (e) {}
        if (!user) {
          const r = await API.createUser({ username, display_name: username, avatar });
          user = { id: r.id, username, display_name: username, avatar };
        } else if (!user.avatar) {
          user.avatar = avatar;
        }
        Auth.set(user);
        document.getElementById('loginModal').classList.add('hidden');
        this.updateBadge(user);
        toast(`欢迎回来,${user.display_name}!`);
        this.render();
      } catch (e) {
        toast('登录失败:' + e.message, 'error');
      }
    };
  },

  switchUser() {
    if (confirm('确定要退出当前用户吗?所有打卡/笔记数据保留,下次登录同名仍可见。')) {
      Auth.clear();
      location.reload();
    }
  },

  bindTopbar() {
    document.querySelectorAll('.nav a').forEach(a => {
      a.addEventListener('click', () => {});
    });
  },

  // 渲染当前路由
  async render() {
    const hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [route, queryStr] = hash.split('?');
    const routeKey = Object.keys(this.routes).find(k => hash.startsWith(k)) || 'dashboard';
    const fn = this.routes[routeKey];

    // 高亮 nav
    document.querySelectorAll('.nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.route === routeKey);
    });

    // 滚动
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 渲染
    const app = document.getElementById('app');
    app.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载中...</p></div>';
    try {
      // 根据路由名决定 this 应绑定到哪个对象
      const ctx = routeKey === 'slides' ? Slides : Pages;
      const html = await fn.call(ctx);
      app.innerHTML = '<div class="fade-in">' + html + '</div>';
    } catch (e) {
      app.innerHTML = `<div class="card"><h3>😢 加载出错</h3><p style="color:var(--red)">${esc(e.message)}</p><pre style="margin-top:10px;font-size:12px;color:var(--muted);white-space:pre-wrap">${esc(e.stack || '')}</pre></div>`;
    }
  },

  // 全局事件委托
  bindGlobalEvents() {
    document.body.addEventListener('click', e => {
      const t = e.target;
      // 用 closest() 处理子元素冒泡的情况(按钮内套了 <i> <span> 等)
      const find = (attr) => t.closest && t.closest('[' + attr + ']');

      // 跳转路由(普通 data-goto)
      if (t.dataset.goto) {
        location.hash = '#/' + t.dataset.goto;
        return;
      }

      // 点击 30 天地图 / 卡片 → 跳到指定天的 today 页
      const gotoDay = find('data-goto-day');
      if (gotoDay) {
        location.hash = '#/today?day=' + gotoDay.dataset.gotoDay;
        return;
      }

      // 点击课程表/技能树的具体任务 → 用 task_id 查 day 再跳转
      const gotoTask = find('data-goto-task');
      if (gotoTask) {
        const taskId = parseInt(gotoTask.dataset.gotoTask);
        this.openTaskById(taskId);
        return;
      }

      // 周筛选(全部 / 第1周 / 第2周 ...)
      const weekBtn = find('data-week-filter');
      if (weekBtn) {
        const w = weekBtn.dataset.weekFilter;
        location.hash = '#/course' + (w ? '?week=' + w : '');
        return;
      }

      // 打卡
      const checkBtn = find('data-check-task');
      if (checkBtn) {
        this.handleCheck(checkBtn);
        return;
      }

      // 笔记
      const noteBtn = find('data-note-action');
      if (noteBtn) {
        this.handleNote(noteBtn);
        return;
      }

      // 答题
      const quizBtn = find('data-quiz-question');
      if (quizBtn) {
        this.handleQuiz(quizBtn);
        return;
      }

      // PPT 演示
      const slideBtn = find('data-slides-action');
      if (slideBtn) {
        this.handleSlides(slideBtn);
        return;
      }
    });

    // 全局键盘事件(演示模式专用)
    document.addEventListener('keydown', e => {
      if (!this.presentation.active) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault(); this.presentationNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); this.presentationPrev();
      } else if (e.key === 'Home') {
        e.preventDefault(); this.presentationGoTo(0);
      } else if (e.key === 'End') {
        e.preventDefault(); this.presentationGoTo(this.presentation.total - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault(); this.presentationExit();
      }
    });
  },

  // 根据 task_id 找到对应的 day 并跳转
  async openTaskById(taskId) {
    try {
      const tasks = await API.listTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        location.hash = '#/today?day=' + task.day;
      } else {
        toast('任务不存在', 'error');
      }
    } catch (e) {
      toast('跳转失败:' + e.message, 'error');
    }
  },

  // 打卡处理
  async handleCheck(t) {
    const u = Auth.get();
    if (!u || !u.id) {
      console.warn('[打卡] 用户未登录,u =', u);
      return toast('请先在仪表盘选择/创建用户', 'error');
    }
    const rawId = t.dataset.checkTask;
    const taskId = parseInt(rawId, 10);
    if (!taskId || isNaN(taskId)) {
      console.error('[打卡] taskId 解析失败,raw =', rawId, 'btn =', t.outerHTML);
      return toast('任务 ID 无效,请刷新后重试', 'error');
    }
    const action = t.dataset.action;
    const reflection = document.getElementById('reflectText')?.value || '';

    try {
      if (action === 'uncheck') {
        await API.uncheck(u.id, taskId);
        toast('已撤销打卡');
      } else {
        await API.toggleCheck({ user_id: u.id, task_id: taskId, status: 'done', reflection });
        toast(action === 'update' ? '打卡已更新' : '🎉 打卡成功!');
      }
      this.render();
    } catch (e) {
      console.error('[打卡] 请求失败:', e);
      toast('操作失败:' + e.message, 'error');
    }
  },

  // 笔记处理
  async handleNote(t) {
    const u = Auth.get();
    if (!u || !u.id) return toast('请先在仪表盘选择/创建用户', 'error');
    const action = t.dataset.noteAction;
    const id = t.dataset.noteId;

    try {
      if (action === 'delete') {
        if (!confirm('确定要删除这篇笔记吗?')) return;
        await API.deleteNote(id);
        toast('笔记已删除');
      } else if (action === 'create') {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const tags = document.getElementById('noteTags').value.trim();
        const related_task_id = document.getElementById('noteTask').value || null;
        if (!title) return toast('请输入标题', 'error');
        await API.createNote({ user_id: u.id, title, content, tags, related_task_id });
        toast('✓ 笔记已保存');
      } else if (action === 'update') {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const tags = document.getElementById('noteTags').value.trim();
        await API.updateNote(id, { title, content, tags });
        toast('✓ 笔记已更新');
      }
      if (action !== 'delete') {
        // 清空表单
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        document.getElementById('noteTags').value = '';
      }
      location.hash = '#/notes';
    } catch (e) {
      toast('操作失败:' + e.message, 'error');
    }
  },

  // 自检题答题
  async handleQuiz(t) {
    const u = Auth.get();
    if (!u || !u.id) return toast('请先在仪表盘选择/创建用户', 'error');
    const qid = parseInt(t.dataset.quizQuestion, 10);
    const choice = parseInt(t.dataset.quizChoice, 10);

    try {
      const r = await API.answerQuiz({ user_id: u.id, question_id: qid, answer: choice });
      const key = 'quiz-state-' + u.id;
      const cur = JSON.parse(localStorage.getItem(key) || '{}');
      cur[qid] = { selected: choice, correct: r.correct, right_answer: r.right_answer, explanation: r.explanation };
      localStorage.setItem(key, JSON.stringify(cur));
      toast(r.correct ? '✓ 答对了!' : '✗ 再想想', r.correct ? 'success' : 'error');
      this.render();
    } catch (e) {
      toast('答题失败:' + e.message, 'error');
    }
  },

  // ========== PPT 演示模式 ==========
  handleSlides(t) {
    const action = t.dataset.slidesAction;
    if (action === 'present') {
      const start = parseInt(t.dataset.slidesStart || '0');
      this.presentationStart(start);
    } else if (action === 'print') {
      this.slidesPrint();
    } else if (action === 'next') this.presentationNext();
    else if (action === 'prev') this.presentationPrev();
    else if (action === 'exit') this.presentationExit();
  },

  presentationStart: function (startIdx) {
    this.presentation.active = true;
    this.presentation.idx = startIdx || 0;
    this.presentation.total = SLIDES_DATA.chapters.length;
    const stage = document.createElement('div');
    stage.id = 'slidesStage';
    stage.className = 'slides-stage';
    document.body.appendChild(stage);
    this.renderSlideContent();
    // 鼠标点击翻页(在 stage 区域内点击右侧前进 / 左侧后退)
    stage.addEventListener('click', e => {
      if (e.target.closest('.slides-controls')) return;
      const w = window.innerWidth;
      if (e.clientX < w * 0.3) this.presentationPrev();
      else this.presentationNext();
    });
  },

  renderSlideContent: function () {
    const stage = document.getElementById('slidesStage');
    if (!stage) return;
    const c = SLIDES_DATA.chapters[this.presentation.idx];
    stage.innerHTML = Slides.renderSlide(c, this.presentation.idx, this.presentation.total) + `
      <div class="slides-controls no-print" onclick="event.stopPropagation()">
        <button onclick="App.presentationPrev()">← 上一页</button>
        <span class="info">${this.presentation.idx + 1} / ${this.presentation.total}</span>
        <button onclick="App.presentationNext()">下一页 →</button>
        <button onclick="App.presentationExit()" title="Esc">✕ 退出</button>
        <button class="primary" onclick="window.print()" title="打印">🖨</button>
      </div>`;
  },

  presentationNext: function () {
    if (!this.presentation.active) return;
    if (this.presentation.idx < this.presentation.total - 1) {
      this.presentation.idx++;
      this.renderSlideContent();
    }
  },

  presentationPrev: function () {
    if (!this.presentation.active) return;
    if (this.presentation.idx > 0) {
      this.presentation.idx--;
      this.renderSlideContent();
    }
  },

  presentationGoTo: function (idx) {
    if (!this.presentation.active) return;
    if (idx >= 0 && idx < this.presentation.total) {
      this.presentation.idx = idx;
      this.renderSlideContent();
    }
  },

  presentationExit: function () {
    const stage = document.getElementById('slidesStage');
    if (stage) stage.remove();
    this.presentation.active = false;
  },

  // 打印讲义:打开一个独立窗口 / 触发系统打印
  slidesPrint: function () {
    if (confirm('将打开浏览器打印对话框。\n推荐选"另存为 PDF" → 大小 A4 横向 → 边距最小。')) {
      window.print();
    }
  }
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());