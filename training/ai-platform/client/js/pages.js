// ========== AI 学习平台 · 8 个页面组件 ==========
// 每个 Page 函数返回 HTML 字符串,绑定交互在 router(app.js) 中统一处理

const Pages = {

  // ---------- 1. 首页 Dashboard ----------
  dashboard: async function () {
    const u = Auth.get();
    if (!u) return '<p>请先登录</p>';
    const [prog, stats] = await Promise.all([
      API.progress(u.id),
      API.taskStats()
    ]);
    const done = prog.done, total = prog.total;
    const percent = prog.percent;
    const todayTask = prog.todayTask;
    const today = prog.currentDay;
    const tasksAll = await API.listTasks();
    const checkedSet = new Set((await API.listChecks(u.id)).map(c => c.task_id));

    return `
      <h1 class="page-title">👋 你好,${esc(u.display_name || u.username)}</h1>
      <p class="page-sub">今天是 30 天学习之旅的 <b style="color:var(--acc)">第 ${today} 天</b>,已完成 ${done}/${total} 项任务 (${percent}%)</p>

      <!-- 总体进度 -->
      <div class="card fade-in" style="margin-bottom:20px">
        <h3>📈 总进度</h3>
        <div class="progress" style="margin:14px 0 10px"><div class="progress-bar" style="width:${percent}%"></div></div>
        <p style="font-size:13px;color:var(--muted)">已完成 ${done} 个任务,还有 ${total - done} 个在路上</p>
      </div>

      <div class="grid grid-2">
        <!-- 今日任务 -->
        <div class="card fade-in" style="animation-delay:.05s">
          <h3>📅 今日任务 · Day ${today}</h3>
          ${todayTask ? `
            <p style="margin:10px 0"><span class="tag purple">第 ${todayTask.week} 周</span>
               <span class="tag blue">${esc(todayTask.category)}</span>
               <span class="tag ${todayTask.difficulty === 'easy' ? 'green' : todayTask.difficulty === 'medium' ? 'orange' : 'pink'}">${esc(todayTask.difficulty)}</span></p>
            <h4 style="color:var(--txt);font-size:16px;margin:8px 0">${esc(todayTask.title)}</h4>
            <p style="font-size:13px;color:var(--muted);margin-bottom:14px">${esc(todayTask.objective)}</p>
            <div class="task-card-actions">
              <button class="btn-primary" data-goto="today">开始今日任务 →</button>
            </div>
          ` : `
            <p style="color:var(--muted);padding:20px 0">🎉 全部 30 天任务已完成!前往自检题巩固知识。</p>
            <button class="btn-primary" data-goto="quiz">去做自检 →</button>
          `}
        </div>

        <!-- 本周分布 -->
        <div class="card fade-in" style="animation-delay:.1s">
          <h3>📊 任务分类分布</h3>
          <div style="margin-top:14px">
            ${stats.byCategory.map(c => {
              const pct = Math.round(c.total / total * 100);
              return `
                <div style="margin-bottom:12px">
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                    <span>${esc(c.category)}</span><span style="color:var(--muted)">${c.total} 项 · ${pct}%</span>
                  </div>
                  <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 4 周任务地图 -->
      <div class="card fade-in" style="margin-top:20px;animation-delay:.15s">
        <h3>🗺️ 30 天任务地图</h3>
        <p style="font-size:13px;color:var(--muted);margin:6px 0 16px">点击任意一天 → 跳到当日任务</p>
        <div style="display:grid;grid-template-columns:repeat(30,1fr);gap:4px;max-width:100%;overflow-x:auto">
          ${tasksAll.map(t => {
            const done = checkedSet.has(t.id);
            const cls = done ? 'done' : (t.day === today ? 'current' : '');
            return `<div class="skill-node ${cls}" style="width:100%;height:42px;border-radius:6px;font-size:11px"
                       data-goto-day="${t.day}" title="Day ${t.day} · ${esc(t.title)}">${t.day}</div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:18px;font-size:12px;color:var(--muted);margin-top:14px">
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--green);border-radius:2px;margin-right:4px"></span>已完成</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--acc);border-radius:2px;margin-right:4px"></span>今日</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:#eef2ff;border:1px solid var(--line);border-radius:2px;margin-right:4px"></span>未开始</span>
        </div>
      </div>
    `;
  },

  // ---------- 2. 今日任务 ----------
  today: async function () {
    const u = Auth.get();
    if (!u) return '<p>请先登录</p>';
    const hash = location.hash.replace(/^#\/?/, '');
    const [, queryStr] = hash.split('?');
    const qs = new URLSearchParams(queryStr || '');
    const overrideDay = parseInt(qs.get('day')) || 0;
    const prog = overrideDay ? await API.progress(u.id, overrideDay) : await API.progress(u.id);
    const day = prog.currentDay;
    const task = prog.todayTask;
    const isViewingPast = overrideDay && overrideDay < day;
    const isViewingFuture = overrideDay && overrideDay > day;
    if (!task) {
      return `
        <h1 class="page-title">🎉 30 天任务已完成!</h1>
        <p class="page-sub">恭喜!你已经系统学习了 AI 工具的核心知识。</p>
        <div class="card"><button class="btn-primary" data-goto="quiz">去做自检题 →</button></div>`;
    }
    const checks = await API.listChecks(u.id);
    const done = checks.find(c => c.task_id === task.id);

    return `
      <h1 class="page-title">📅 Day ${task.day} · ${esc(task.title)}</h1>
      <p class="page-sub">
        <span class="tag purple">第 ${task.week} 周 · ${esc(task.phase)}</span>
        <span class="tag blue">${esc(task.category)}</span>
        <span class="tag ${task.difficulty === 'easy' ? 'green' : task.difficulty === 'medium' ? 'orange' : 'pink'}">难度 ${esc(task.difficulty)}</span>
        <span class="tag">⏱ ${task.estimated_min} 分钟</span>
        ${isViewingPast ? '<span class="tag orange">📖 回看模式</span>' : ''}
        ${isViewingFuture ? '<span class="tag pink">⏳ 未来任务 · 暂不可打卡</span>' : ''}
      </p>

      <!-- 目标 -->
      <div class="card fade-in">
        <h3>🎯 学习目标</h3>
        <p style="margin-top:8px;font-size:15px">${esc(task.objective)}</p>
      </div>

      <!-- 步骤 -->
      <div class="card fade-in" style="animation-delay:.05s">
        <h3>📝 操作步骤</h3>
        <ol style="margin-top:10px;line-height:1.9">
          ${task.steps.map(s => `<li>${esc(s)}</li>`).join('')}
        </ol>
      </div>

      <!-- 验收标准 -->
      <div class="card fade-in" style="animation-delay:.1s">
        <h3>✅ 验收标准</h3>
        <p style="background:#f0fdf4;border-left:3px solid var(--green);padding:12px;border-radius:6px;margin-top:10px;font-size:14px;color:#065f46">${esc(task.verification)}</p>
      </div>

      <!-- 交付物 -->
      <div class="card fade-in" style="animation-delay:.15s">
        <h3>📦 交付物</h3>
        <p style="background:#fffbeb;border-left:3px solid var(--orange);padding:12px;border-radius:6px;margin-top:10px;font-size:14px;color:#92400e">${esc(task.deliverable)}</p>
      </div>

      <!-- 打卡 -->
      <div class="card fade-in" style="animation-delay:.2s">
        <h3>${done ? '✅ 已打卡' : '👆 完成任务?'}</h3>
        ${isViewingFuture ? `
          <p style="margin-top:12px;color:var(--muted);font-size:14px">⏳ 这是一个未来任务,可以提前了解内容,但要等到 Day ${task.day} 才能打卡。</p>
        ` : `
          <div style="margin-top:14px">
            <label>心得 / 反思 (可选)</label>
            <textarea id="reflectText" placeholder="例如:遇到什么问题?学到了什么?">${esc(done ? done.reflection : '')}</textarea>
          </div>
          <div class="task-card-actions" style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
            ${done ? `
              <button class="btn-ghost" data-check-task="${task.id}" data-action="uncheck">撤销打卡</button>
              <button class="btn-primary" data-check-task="${task.id}" data-action="update">更新打卡</button>
            ` : `
              <button class="btn-success" data-check-task="${task.id}" data-action="check">✓ 完成打卡</button>
              <button class="btn-ghost" data-goto="notes">📝 记笔记</button>
            `}
          </div>
        `}
      </div>

      <!-- 上下任务导航 -->
      <div style="display:flex;justify-content:space-between;margin-top:30px;gap:10px">
        <button class="btn-ghost" data-goto="course">← 返回课程列表</button>
        ${task.day < 30 ? `<button class="btn-primary" data-goto-day="${task.day + 1}">Day ${task.day + 1} →</button>` : `<button class="btn-ghost" data-goto="dashboard">回到首页 →</button>`}
      </div>
      ${task.day > 1 ? `<div style="margin-top:10px"><button class="btn-ghost" data-goto-day="${task.day - 1}">← Day ${task.day - 1}</button></div>` : ''}
    `;
  },

  // ---------- 3. 课程(30 天任务列表)----------
  course: async function () {
    const u = Auth.get();
    if (!u) return '<p>请先登录</p>';
    const [tasks, prog, checks] = await Promise.all([
      API.listTasks(),
      API.progress(u.id),
      API.listChecks(u.id)
    ]);
    const doneSet = new Set(checks.map(c => c.task_id));
    const checkedTaskId = new URLSearchParams(location.hash.split('?')[1] || '').get('task');
    const filterWeek = new URLSearchParams(location.hash.split('?')[1] || '').get('week');

    // 按周分组
    const grouped = {};
    tasks.forEach(t => {
      if (filterWeek && String(t.week) !== filterWeek) return;
      if (!grouped[t.week]) grouped[t.week] = [];
      grouped[t.week].push(t);
    });

    const weekNames = {
      1: '第 1 周 · AI 工具分层认知',
      2: '第 2 周 · Skill 与插件 (DSH)',
      3: '第 3 周 · Codex 与 Agent 模式',
      4: '第 4 周 · 自动化工作流'
    };

    return `
      <h1 class="page-title">📖 30 天课程目录</h1>
      <p class="page-sub">每天 30~60 分钟,系统掌握 AI 工具使用 · 当前进度 ${prog.done}/${prog.total} (${prog.percent}%)</p>

      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
        <button class="btn-ghost" data-week-filter="">全部</button>
        ${[1,2,3,4].map(w => `<button class="btn-ghost" data-week-filter="${w}">第 ${w} 周</button>`).join('')}
      </div>

      ${Object.keys(grouped).sort().map(w => {
        const wk = grouped[w];
        const doneCount = wk.filter(t => doneSet.has(t.id)).length;
        return `
          <div class="card fade-in" style="margin-bottom:20px">
            <h3>${weekNames[w] || '第 '+w+' 周'}</h3>
            <p style="font-size:13px;color:var(--muted);margin-bottom:14px">已完成 ${doneCount} / ${wk.length} 项</p>
            <div class="progress" style="margin-bottom:14px"><div class="progress-bar" style="width:${Math.round(doneCount/wk.length*100)}%"></div></div>
            <table>
              <thead>
                <tr><th>Day</th><th>标题</th><th>分类</th><th>难度</th><th>时长</th><th>状态</th><th></th></tr>
              </thead>
              <tbody>
                ${wk.map(t => {
                  const done = doneSet.has(t.id);
                  const current = t.day === prog.currentDay;
                  return `
                    <tr style="${current ? 'background:rgba(122,162,255,.08)' : ''}">
                      <td><b>${t.day}</b></td>
                      <td>${esc(t.title)}</td>
                      <td><span class="tag blue">${esc(t.category)}</span></td>
                      <td><span class="${done ? 'diff' : 'diff-'+t.difficulty}">${esc(t.difficulty)}</span></td>
                      <td>${t.estimated_min}m</td>
                      <td>${done ? '<span class="tag green">✓ 完成</span>' : current ? '<span class="tag orange">▶ 当前</span>' : '<span class="tag">未开始</span>'}</td>
                      <td><button class="btn-ghost" style="font-size:12px;padding:4px 10px" data-goto-task="${t.id}">查看</button></td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;
      }).join('')}
    `;
  },

  // ---------- 4. 技能树 ----------
  skills: async function () {
    const u = Auth.get();
    if (!u) return '<p>请先登录</p>';
    const [tasks, prog, checks] = await Promise.all([
      API.listTasks(),
      API.progress(u.id),
      API.listChecks(u.id)
    ]);
    const doneSet = new Set(checks.map(c => c.task_id));

    // 按类别分组
    const byCat = {};
    tasks.forEach(t => {
      if (!byCat[t.category]) byCat[t.category] = [];
      byCat[t.category].push(t);
    });

    // 5 大能力维度
    const dims = [
      { key: 'AI基础', icon: '🧠', desc: '理解 AI 工具分层与边界' },
      { key: 'MCP', icon: '🔌', desc: '让 AI 连接外部工具' },
      { key: 'Skill', icon: '🧩', desc: '封装可复用的工作流' },
      { key: 'Codex', icon: '🤖', desc: '云端编码 Agent' },
      { key: 'Copilot', icon: '⚡', desc: 'VS Code 中的 AI 助手' },
      { key: '自动化', icon: '🔁', desc: '把工作流串起来' }
    ];

    return `
      <h1 class="page-title">🌳 技能树</h1>
      <p class="page-sub">每一颗技能点亮,都代表一类工作流被掌握 · 已点亮 ${prog.done}/${prog.total}</p>

      <div class="grid grid-3">
        ${dims.map((d, i) => {
          const list = byCat[d.key] || [];
          const doneCount = list.filter(t => doneSet.has(t.id)).length;
          const pct = list.length ? Math.round(doneCount / list.length * 100) : 0;
          return `
            <div class="card fade-in" style="animation-delay:${i * 0.05}s">
              <h3>${d.icon} ${d.key}</h3>
              <p style="margin:6px 0 14px">${d.desc}</p>
              <div class="progress" style="margin-bottom:8px"><div class="progress-bar" style="width:${pct}%"></div></div>
              <p style="font-size:12px;color:var(--muted);margin-bottom:12px">${doneCount} / ${list.length} · ${pct}%</p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
                ${list.map(t => {
                  const done = doneSet.has(t.id);
                  return `<span class="skill-node ${done ? 'done' : ''}" style="width:48px;height:48px;font-size:10px;background:${done ? 'rgba(61,220,151,.1)' : 'var(--bg-soft)'};cursor:pointer"
                            data-goto-task="${t.id}" title="Day ${t.day} · ${esc(t.title)}">${done ? '✓' : t.day}</span>`;
                }).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>

      <div class="card fade-in" style="margin-top:20px">
        <h3>🎯 学习路径建议</h3>
        <ol style="margin-top:10px;line-height:2">
          <li>先点亮 <b>🧠 AI基础</b> —— 搞清楚"AI 不是生成 AI 的一部分"</li>
          <li>再学 <b>🔌 MCP</b> —— 让 AI 能调用外部工具</li>
          <li>封装 <b>🧩 Skill</b> —— 把重复操作打包</li>
          <li>上手 <b>🤖 Codex</b> —— 让 AI 自己写代码改代码</li>
          <li>配置 <b>⚡ Copilot</b> —— 在 VS Code 里实时协作</li>
          <li>最后做 <b>🔁 自动化</b> —— 把上面所有串成工作流</li>
        </ol>
      </div>
    `;
  },

  // ---------- 5. 进度统计 ----------
  progress: async function () {
    const u = Auth.get();
    if (!u) return '<p>请先登录</p>';
    const [prog, score, stats] = await Promise.all([
      API.progress(u.id),
      API.quizScore(u.id),
      API.taskStats()
    ]);

    // 周环形图
    const weekNames = ['第 1 周 · AI 基础', '第 2 周 · Skill 与插件', '第 3 周 · Codex', '第 4 周 · 自动化'];

    return `
      <h1 class="page-title">📊 学习进度</h1>
      <p class="page-sub">用数据看到自己的成长 · 数据每天自动更新</p>

      <div class="grid grid-4">
        <div class="card fade-in">
          <p style="color:var(--muted);font-size:13px">总任务</p>
          <h2 style="font-size:32px;margin:8px 0;color:var(--acc)">${prog.total}</h2>
          <p style="font-size:12px;color:var(--muted)">已完成 ${prog.done} (${prog.percent}%)</p>
        </div>
        <div class="card fade-in" style="animation-delay:.05s">
          <p style="color:var(--muted);font-size:13px">当前进度</p>
          <h2 style="font-size:32px;margin:8px 0;color:var(--green)">第 ${prog.currentDay} 天</h2>
          <p style="font-size:12px;color:var(--muted)">/ 共 30 天</p>
        </div>
        <div class="card fade-in" style="animation-delay:.1s">
          <p style="color:var(--muted);font-size:13px">自检正确率</p>
          <h2 style="font-size:32px;margin:8px 0;color:var(--orange)">${score.accuracy}%</h2>
          <p style="font-size:12px;color:var(--muted)">${score.right} / ${score.total} 题</p>
        </div>
        <div class="card fade-in" style="animation-delay:.15s">
          <p style="color:var(--muted);font-size:13px">总进度</p>
          <div style="position:relative;width:80px;height:80px;margin:10px auto">
            <svg class="progress-ring" width="80" height="80">
              <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#7aa2ff"/><stop offset="100%" stop-color="#3ddc97"/>
              </linearGradient></defs>
              <circle class="bg" cx="40" cy="40" r="34"/>
              <circle class="fg" cx="40" cy="40" r="34"
                stroke-dasharray="${2*Math.PI*34}"
                stroke-dashoffset="${2*Math.PI*34 * (1 - prog.percent/100)}"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--acc)">${prog.percent}%</div>
          </div>
        </div>
      </div>

      <div class="card fade-in" style="margin-top:20px">
        <h3>📅 4 周进度对比</h3>
        <div class="grid grid-4" style="margin-top:14px">
          ${prog.byWeek.map((w, i) => {
            const pct = w.total > 0 ? Math.round(w.done / w.total * 100) : 0;
            return `
              <div style="text-align:center">
                <p style="font-size:13px;color:var(--muted);margin-bottom:8px">${weekNames[w.week-1] || '第 '+w.week+' 周'}</p>
                <div class="progress" style="height:14px"><div class="progress-bar" style="width:${pct}%"></div></div>
                <p style="font-size:13px;margin-top:6px"><b style="color:var(--acc)">${w.done}</b> / ${w.total}</p>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card fade-in" style="margin-top:20px">
        <h3>📈 任务分类完成度</h3>
        <table style="margin-top:14px">
          <thead><tr><th>分类</th><th>总任务</th><th>占比</th></tr></thead>
          <tbody>
            ${stats.byCategory.map(c => `
              <tr>
                <td>${esc(c.category)}</td>
                <td>${c.total}</td>
                <td>${Math.round(c.total / stats.total * 100)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // ---------- 6. 资源中心 ----------
  resources: async function () {
    const [byMcp, byDsh, byCodex, byCopilot, all] = await Promise.all([
      API.listResources('MCP'),
      API.listResources('DSH'),
      API.listResources('Codex'),
      API.listResources('Copilot'),
      API.listResources()
    ]);
    const all_ = all;

    return `
      <h1 class="page-title">🎬 学习资源中心</h1>
      <p class="page-sub">官方文档 / 视频 / 教程 · 每个任务卡里都有引用</p>

      ${this._resourceGroup('🔌 MCP 模型上下文协议', byMcp)}
      ${this._resourceGroup('🧩 DeepSeek Harness', byDsh)}
      ${this._resourceGroup('🤖 OpenAI Codex', byCodex)}
      ${this._resourceGroup('⚡ GitHub Copilot', byCopilot)}

      <div class="card fade-in" style="margin-top:20px">
        <h3>📚 视频教程推荐</h3>
        <ul style="margin-top:10px;line-height:2;font-size:14px">
          <li>🎬 <b>官方入门视频:</b> DeepSeek Harness / Codex 官网 "Quick Start" 系列</li>
          <li>🎬 <b>YouTube:</b> 搜索 "MCP tutorial"、"GPT Actions"、"Copilot Agent mode"</li>
          <li>🎬 <b>B 站:</b> 搜索 "AI 工具 实操"、"AI Agent 教程"</li>
          <li>📖 <b>官方文档:</b> 优先看官方文档,比二手教程准确</li>
          <li>💬 <b>社区:</b> GitHub Discussions、Discord、Reddit r/LocalLLaMA</li>
        </ul>
      </div>
    `;
  },

  _resourceGroup: function (title, list) {
    if (!list || !list.length) return '';
    return `
      <div class="card fade-in" style="margin-bottom:16px">
        <h3>${title}</h3>
        <div class="grid grid-2" style="margin-top:14px">
          ${list.map(r => `
            <div style="background:#eff6ff;border:1px solid var(--line);border-radius:8px;padding:14px">
              <h4 style="color:var(--acc);margin-bottom:6px">${esc(r.title)}</h4>
              <p style="font-size:13px;color:var(--muted);margin-bottom:8px">${esc(r.description)}</p>
              <p style="font-size:12px;color:var(--muted)">📌 类型: ${esc(r.type)} ${r.url ? '· <a href="' + esc(r.url) + '" target="_blank">🔗 打开</a>' : ''}</p>
              ${r.tags && r.tags.length ? `<div style="margin-top:8px">${r.tags.map(t => `<span class="tag" style="margin-right:4px">${esc(t)}</span>`).join('')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  // ---------- 7. 笔记 ----------
  notes: async function () {
    const u = Auth.get();
    if (!u) return '<p>请先登录</p>';
    const notes = await API.listNotes(u.id);
    const editId = new URLSearchParams(location.hash.split('?')[1] || '').get('edit');
    const editing = editId ? notes.find(n => n.id == editId) : null;
    const tasks = await API.listTasks();

    return `
      <h1 class="page-title">📝 学习笔记</h1>
      <p class="page-sub">记录你的踩坑、收获、心得 · 共 ${notes.length} 篇</p>

      <div class="grid grid-2" style="gap:24px">
        <!-- 编辑区 -->
        <div class="card fade-in">
          <h3>${editing ? '✏️ 编辑笔记' : '➕ 新建笔记'}</h3>
          <div style="margin-top:14px">
            <label>标题</label>
            <input id="noteTitle" placeholder="例:MCP 连接 GitHub 的踩坑记录" value="${esc(editing ? editing.title : '')}">
          </div>
          <div style="margin-top:10px">
            <label>标签 (逗号分隔)</label>
            <input id="noteTags" placeholder="MCP,GitHub,踩坑" value="${esc(editing ? editing.tags : '')}">
          </div>
          <div style="margin-top:10px">
            <label>关联任务 (可选)</label>
            <select id="noteTask">
              <option value="">无</option>
              ${tasks.map(t => `<option value="${t.id}" ${editing && editing.related_task_id == t.id ? 'selected' : ''}>Day ${t.day} · ${esc(t.title)}</option>`).join('')}
            </select>
          </div>
          <div style="margin-top:10px">
            <label>内容 (支持 Markdown)</label>
            <textarea id="noteContent" style="min-height:200px" placeholder="写下你的心得...">${esc(editing ? editing.content : '')}</textarea>
          </div>
          <div style="margin-top:14px;display:flex;gap:10px">
            <button class="btn-primary" data-note-action="${editing ? 'update' : 'create'}" data-note-id="${editing ? editing.id : ''}">${editing ? '保存修改' : '✓ 保存笔记'}</button>
            ${editing ? `<button class="btn-ghost" data-goto="notes">取消</button>` : ''}
          </div>
        </div>

        <!-- 笔记列表 -->
        <div class="fade-in" style="animation-delay:.05s">
          <h3 style="margin-bottom:14px">📚 我的笔记 (${notes.length})</h3>
          ${notes.length === 0 ? '<div class="card" style="text-align:center;color:var(--muted)">还没有笔记,先在左边写第一篇吧~</div>' :
            notes.map(n => {
              const linkedTask = n.related_task_id ? tasks.find(t => t.id == n.related_task_id) : null;
              return `
                <div class="note-card">
                  <div class="note-title">${esc(n.title)}</div>
                  <div class="note-meta">
                    <span>📅 ${esc(n.updated_at)}</span>
                    ${linkedTask ? `<span>🔗 Day ${linkedTask.day}</span>` : ''}
                    ${n.tags ? n.tags.split(',').map(t => `<span class="tag" style="font-size:10px">${esc(t.trim())}</span>`).join('') : ''}
                  </div>
                  <div class="note-content">${esc(n.content)}</div>
                  <div style="display:flex;gap:8px;margin-top:10px">
                    <button class="btn-ghost" style="font-size:12px;padding:4px 10px" data-goto="notes?edit=${n.id}">编辑</button>
                    <button class="btn-danger" data-note-action="delete" data-note-id="${n.id}">删除</button>
                  </div>
                </div>`;
            }).join('')
          }
        </div>
      </div>
    `;
  },

  // ---------- 8. 自检题 ----------
  quiz: async function () {
    const u = Auth.get();
    if (!u) return '<p>请先登录</p>';
    const score = await API.quizScore(u.id);
    const questions = await API.listQuiz();
    const answeredRaw = localStorage.getItem('quiz-state-' + u.id);
    const answered = answeredRaw ? JSON.parse(answeredRaw) : {};

    return `
      <h1 class="page-title">✅ 自检题</h1>
      <p class="page-sub">检验 30 天学习效果 · 当前正确率 ${score.accuracy}% (${score.right}/${score.total})</p>

      <div class="card fade-in" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(122,162,255,.1),rgba(157,123,255,.1))">
        <h3>📊 你的成绩</h3>
        <div style="display:flex;gap:24px;margin-top:14px;flex-wrap:wrap">
          <div><span style="color:var(--muted)">已答题</span><h2 style="color:var(--acc)">${score.total}</h2></div>
          <div><span style="color:var(--muted)">答对</span><h2 style="color:var(--green)">${score.right}</h2></div>
          <div><span style="color:var(--muted)">正确率</span><h2 style="color:var(--orange)">${score.accuracy}%</h2></div>
        </div>
      </div>

      ${questions.map((q, idx) => {
        const myAnswer = answered[q.id];
        const showResult = myAnswer !== undefined;
        return `
          <div class="quiz-card fade-in" data-quiz-id="${q.id}" style="animation-delay:${idx * 0.03}s">
            <div class="quiz-q">
              <span class="qno">${idx + 1}</span>
              <span>${esc(q.question)}</span>
              <span class="tag" style="margin-left:auto">${esc(q.category)}</span>
            </div>
            <div class="quiz-options">
              ${q.options.map((opt, oi) => {
                let cls = '';
                if (showResult) {
                  if (oi === myAnswer.right_answer) cls = 'correct';
                  else if (oi === myAnswer.selected) cls = 'wrong';
                } else if (oi === myAnswer) cls = 'selected';
                return `<div class="quiz-option ${cls}" data-quiz-question="${q.id}" data-quiz-choice="${oi}">${esc(opt)}</div>`;
              }).join('')}
            </div>
            ${showResult ? `
              <div class="quiz-explain">
                <b>${myAnswer.correct ? '✓ 正确' : '✗ 错误'}</b> · 正确答案: ${esc(q.options[myAnswer.right_answer])}
                <br><br>${esc(myAnswer.explanation)}
              </div>
            ` : ''}
          </div>`;
      }).join('')}
    `;
  }
};