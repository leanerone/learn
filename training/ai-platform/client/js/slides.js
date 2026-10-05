// ========== AI 学习平台 · PPT 讲义 / 放映 ==========
// 共 10 章,移植自 ai-tools-tutorial.html 并补充内容
// 渲染方式:列表视图 + 演示模式(全屏逐页)+ 打印导出 PDF

const SLIDES_DATA = {
  meta: { total: 10, estMin: 45 },
  chapters: [
    {
      id: 1, title: '你脑子里的乱线团,其实只有 3 层', icon: '🧠',
      hero: 'AI 工具再花哨,底层就三类:对话型 / 工具型 / 智能体型',
      points: [
        { tag: '💬 对话型', desc: 'ChatGPT 网页 / DeepSeek 网页。适合回答概念、起稿、闲聊,但操作不了你的电脑。' },
        { tag: '🛠 工具型', desc: 'Copilot / Continue / Codeium。嵌在编辑器里,补全 / 改写 / 解释代码,要求"人在回路"。' },
        { tag: '🤖 智能体型', desc: 'Codex / Cursor Agent / DSH 智能体。能拆解任务、读写文件、跑命令、最终交付结果。' }
      ],
      bottomLine: '日常 80% 用工具型,复杂任务交给智能体型,概念类问题对话型最快。',
      tip: '🚨 混淆根源在于把它们当成同一种东西,其实它们的能力边界完全不同。'
    },
    {
      id: 2, title: '一张图:用户 · 模型 · MCP · Skill · Agent', icon: '🗺',
      hero: '五者的关系:模型是发动机,MCP 是加油口,Skill 是预设档位,用户是驾驶员',
      points: [
        { tag: '👤 用户', desc: '提需求 + 验收结果。' },
        { tag: '🧠 模型', desc: '大语言模型本身(DeepSeek-V3 / GPT-5 / Claude)。' },
        { tag: '🔌 MCP', desc: '模型调用外部工具的协议标准,像 USB 接口,定义了"模型怎么连 GitHub / 数据库"。' },
        { tag: '🧩 Skill', desc: '把"提示词 + 工具链 + 步骤"打包成可复用模块,一键调用。' },
        { tag: '🤖 Agent', desc: '能循环使用 MCP/Skill、自动规划多步任务的 AI。' }
      ],
      bottomLine: '记忆口诀:Model 是脑,MCP 是手,Skill 是肌肉记忆,Agent 是自动化的"我"。',
      tip: '🔁 调用关系:Agent 调 Skill → Skill 内部用 MCP → MCP 调外部服务 → 结果返回给 Model。'
    },
    {
      id: 3, title: '三大工具定位:DSH / Codex / VS Code Copilot', icon: '🎯',
      hero: '一个都不能互相替代,组合使用才出效率',
      points: [
        { tag: '🇨🇳 DeepSeek Harness (DSH)', desc: '国内工具,有插件市场,中文支持好。适合:日常对话、装现成插件、轻度工作流编排。' },
        { tag: '🌍 OpenAI Codex', desc: '云端编码 Agent。三种形态:网页、桌面 App、CLI。最强:多文件重构、跑长任务。' },
        { tag: '💼 VS Code + GitHub Copilot', desc: '你日常写代码的主战场。Agent 模式可独立完成多文件改动,Edit 模式适合小步快跑。' }
      ],
      bottomLine: 'DSH = 中文对话 + 插件中心 / Codex = 重活外包 / Copilot = 贴身编码。',
      tip: '💡 工具不在多,在对。把每个工具用在最擅长的场景。'
    },
    {
      id: 4, title: 'DeepSeek Harness:安装 / 插件 / 自造 / 工作台', icon: '🧩',
      hero: '5 分钟搞懂 DSH 怎么上手,以及怎么造一个自己的',
      points: [
        { tag: '🚀 安装', desc: '官网下载安装 → 登录账号 → 默认聊天窗口直接用。' },
        { tag: '🧩 插件市场', desc: '顶部"插件中心" → 浏览分类(效率 / 写作 / 编程 / 联网) → 一键安装 → 聊天窗口 /菜单调用。' },
        { tag: '🛠 自造插件', desc: '进入插件开发模式 → 写 manifest.json(描述插件) + 提示词 + 工具配置 → 一键发布到本地 / 商店。' },
        { tag: '🗂 工作台', desc: '把常用的对话 / 插件 / 文件夹拖到工作台,组合成"项目视图"。' }
      ],
      bottomLine: '装现成插件用 5 分钟,自造插件用 1 小时,造完可以分享给全公司。',
      tip: '⚡ EAP 工程师场景:造一个"EAP 代码审查"插件,把你厂的命名规范写进去,自动审查提交的代码。'
    },
    {
      id: 5, title: 'Codex:网页 / 桌面 / CLI 三形态', icon: '🤖',
      hero: '同款大脑,三种用法,挑适合你任务的',
      points: [
        { tag: '🌐 网页版', desc: 'chatgpt.com/codex。零配置,适合临时跑小任务、读仓库、生成 PR。' },
        { tag: '🖥 桌面 App', desc: '长任务后台跑、本地文件权限更细、可观测执行日志。' },
        { tag: '⌨️ CLI', desc: 'codex 命令。写脚本、塞进 CI / cron、自动化。最强大也最需要学习。' }
      ],
      bottomLine: '轻量用网页,长任务用桌面,自动化用 CLI。',
      tip: '🧪 学习路径:第 1 周用网页,第 2 周用桌面,第 3 周上 CLI。'
    },
    {
      id: 6, title: 'VS Code + GitHub Copilot:你厂的主力', icon: '⚡',
      hero: '你们已买 Copilot,把它用透就是最大 ROI',
      points: [
        { tag: '✍️ Inline 补全', desc: '边写边提示,TAB 接受、Alt+] 下一条。基础功,很多同事只用到了这一层。' },
        { tag: '💬 Chat 窗口', desc: 'Ctrl+I 唤起,问"这段代码干嘛的"、"改个名字"、"加日志",日常 80% 问题在这里解。' },
        { tag: '✏️ Edit 模式', desc: '选中代码块,让它改。最适合:重构、加注释、修风格。' },
        { tag: '🧠 Agent 模式', desc: '让它读整个项目 → 拆任务 → 多文件改动 → 跑测试。复杂任务交给它。' },
        { tag: '🔌 MCP 配置', desc: '在 Copilot 里挂 MCP server,可以连 GitHub / 数据库 / 内部 API。' }
      ],
      bottomLine: 'Chat 用对话,Edit 改小段,Agent 改多文件,MCP 接内部系统。',
      tip: '🛡 合规要点:敏感代码块不要全贴,选中关键段再问;开启审计日志;敏感目录用 .gitignore 排除。'
    },
    {
      id: 7, title: 'EAP 场景实战剧本', icon: '🏭',
      hero: '把 AI 落到你日常的 5 个真实剧本',
      points: [
        { tag: '📜 剧本 1 · 设备脚本生成', desc: '需求:"写一个 SECS-II 消息收发脚本",Copilot Agent 模式 + 项目上下文 → 直接生成可运行版本。' },
        { tag: '🔍 剧本 2 · 报错排查', desc: '把日志关键 5 行 + 堆栈贴进 Chat,让它定位 + 给修复方案。' },
        { tag: '🔧 剧本 3 · 命名规范审查', desc: '选中文件,问"按我厂命名规范审查",AI 自动指出违规行。' },
        { tag: '📊 剧本 4 · 数据报表', desc: 'Oracle SQL 让 Copilot 写,复杂 JOIN 让 Codex Agent 写多文件版本。' },
        { tag: '🧪 剧本 5 · 单元测试', desc: '选中代码,Ask:"为这函数写 5 个边界用例",生成 pytest/junit 一键跑。' }
      ],
      bottomLine: 'AI 不是替代你,而是把"敲键盘"变成"审屏幕"。',
      tip: '🎯 关键习惯:每段 AI 输出前先自己想清楚要什么 → 描述清楚 → 让 AI 实现 → 自己验证。'
    },
    {
      id: 8, title: '从"问答"到"自动化工作流"', icon: '🔁',
      hero: '升级路径:手动问 → 提示词模板 → Skill → 自动化',
      points: [
        { tag: '🥉 第 1 阶:手动问答', desc: '每次敲字问 AI。效率 1x。' },
        { tag: '🥈 第 2 阶:提示词模板', desc: '把好用的提问存成模板,复用。效率 3x。' },
        { tag: '🥇 第 3 阶:Skill 化', desc: '把"模板 + 工具 + 步骤"打包,一键调。效率 8x。' },
        { tag: '💎 第 4 阶:自动化', desc: 'Skill 串成 cron / GitHub Action / CI pipeline,无人值守。效率 20x。' }
      ],
      bottomLine: '你能从 1 阶爬到 3 阶,就已经领先 80% 同事;到 4 阶就稀缺了。',
      tip: '📈 学习节奏:每 1 周尝试上一个新台阶,30 天后至少稳定在 3 阶。'
    },
    {
      id: 9, title: '视频 & 文档清单', icon: '🎬',
      hero: '官方优先,二手教程补充,B 站 / YouTube 都齐',
      points: [
        { tag: '🔌 MCP', desc: '《2025 最全 MCP 协议教程》(鱼皮)、Anthropic 官方文档 modelcontextprotocol.io、Fireship 100 秒科普。' },
        { tag: '🧩 DSH', desc: '《DeepSeek Harness 实战:从入门到插件开发》(B 站)、DeepSeek 官方文档 platform.deepseek.com。' },
        { tag: '🤖 Codex', desc: 'OpenAI Codex 官方仓库(README)、《Codex CLI 实战》(B 站搜索)。' },
        { tag: '⚡ Copilot', desc: '《GitHub Copilot 全套教程》(B 站,重点 Agent + MCP)、官方文档 docs.github.com/copilot。' }
      ],
      bottomLine: '学习路径 = 1 个官方文档 + 1 个 B 站实战 + 自己动手做一遍。',
      tip: '⏰ 每周留 1 小时专门看视频,其他时间动手做,效果远好于只看不练。'
    },
    {
      id: 10, title: '30 天落地计划:从今天到能讲解', icon: '🚀',
      hero: '4 周递进:认知 → 装插件 → 用 Agent → 做自动化',
      points: [
        { tag: '📅 第 1 周(7 天)', desc: 'AI 三层认知 + MCP 概念 + 装 3 个 DSH 插件 + 区分对话/工具/智能体。' },
        { tag: '📅 第 2 周(7 天)', desc: '自造一个 Skill,挂到 DSH 工作台;开始用 Copilot Chat + Edit 模式。' },
        { tag: '📅 第 3 周(7 天)', desc: 'Codex 网页 / 桌面 / CLI 各上手一次;用 Copilot Agent 改 1 个完整需求。' },
        { tag: '📅 第 4 周(9 天)', desc: '把常用 Skill 接 cron / GitHub Action;复盘笔记;给同事讲一次,完成闭环。' }
      ],
      bottomLine: '终点状态:能向不懂 AI 的同事讲清楚 MCP/Skill/Agent,能用 AI 工具自动化自己一周的工作。',
      tip: '🏆 平台已经为你建好 → 进"今日任务"按部就班,每天 30~60 分钟,30 天后你就是这个领域的"传道者"。'
    }
  ]
};

// ========== 渲染:列表视图 ==========
const Slides = {
  chapters: SLIDES_DATA.chapters,

  // 列表视图(目录 + 全章节内容)
  listView: async function () {
    const self = this;
    const chapters = SLIDES_DATA.chapters;
    return `
      <h1 class="page-title">🎞️ PPT 讲义</h1>
      <p class="page-sub">共 ${SLIDES_DATA.meta.total} 章 · 约 ${SLIDES_DATA.meta.estMin} 分钟讲完 · 来源:移植自 ai-tools-tutorial.html 并补充内容</p>

      <div class="card fade-in" style="margin-bottom:24px;background:linear-gradient(135deg,#dbeafe,#ede9fe);border:none">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
          <div>
            <h3 style="color:var(--txt)">🎬 进入演示模式</h3>
            <p style="color:var(--muted);font-size:14px;margin-top:4px">全屏放映 · 支持键盘 ←→ 翻页 · Home/End 跳首尾 · Esc 退出</p>
          </div>
          <button class="btn-primary" data-slides-action="present" data-slides-start="0">▶ 从头开始放映</button>
        </div>
      </div>

      <div class="grid grid-2">
        ${chapters.map((c, i) => `
          <div class="card fade-in" style="animation-delay:${i*0.04}s">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
              <h3>${c.icon} 第 ${c.id} 章 · ${esc(c.title.split('·')[0])}</h3>
              <button class="btn-ghost" style="font-size:12px;padding:4px 10px" data-slides-action="present" data-slides-start="${i}">放映</button>
            </div>
            <p style="color:var(--muted);font-size:14px;margin-bottom:14px">${esc(c.hero)}</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
              ${c.points.map(p => `<span class="tag blue">${esc(p.tag)}</span>`).join('')}
            </div>
            <p style="background:#f0fdf4;border-left:3px solid var(--green);padding:10px;border-radius:6px;font-size:13px;color:#065f46;margin-top:10px">💡 ${esc(c.bottomLine)}</p>
          </div>
        `).join('')}
      </div>

      <div class="card fade-in" style="margin-top:24px">
        <h3>🖨 导出选项</h3>
        <p style="color:var(--muted);font-size:14px;margin-bottom:14px">打印 / 导出 PDF 时,自动切换为讲义版式(每页 1 章,黑白可读)</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-primary" data-slides-action="print">🖨 打印 / 导出 PDF</button>
          <button class="btn-ghost" data-slides-action="present" data-slides-start="0">▶ 全屏放映</button>
        </div>
      </div>

      <!-- 完整章节讲义(可滚动) -->
      <div class="card fade-in" style="margin-top:24px;padding:0;overflow:hidden">
        <div style="padding:20px 24px;border-bottom:1px solid var(--line);background:#f8fafd">
          <h3>📜 完整讲义(可滚动)</h3>
          <p style="color:var(--muted);font-size:13px;margin-top:4px">每一章的内容,可以直接读 / 复制 / 二次加工</p>
        </div>
        <div style="padding:24px;max-height:600px;overflow-y:auto">
          ${chapters.map(c => self._chapterContent(c)).join('')}
        </div>
      </div>
    `;
  },

  // 单章正文(讲义用)
  _chapterContent: function (c) {
    return `
      <section style="margin-bottom:36px;padding-bottom:24px;border-bottom:1px dashed var(--line)">
        <h2 style="font-size:22px;color:var(--txt);margin-bottom:8px">${c.icon} 第 ${c.id} 章 · ${esc(c.title)}</h2>
        <p style="font-size:15px;color:var(--acc-2);font-weight:600;margin-bottom:14px">${esc(c.hero)}</p>
        <div style="display:grid;gap:10px;margin-bottom:14px">
          ${c.points.map(p => `
            <div style="padding:10px 14px;background:#f8fafd;border-left:3px solid var(--acc);border-radius:6px">
              <b style="color:var(--acc)">${esc(p.tag)}</b>
              <p style="margin-top:4px;color:var(--txt-2);font-size:14px">${esc(p.desc)}</p>
            </div>
          `).join('')}
        </div>
        <p style="background:#fffbeb;border-left:3px solid var(--orange);padding:10px;border-radius:6px;color:#92400e;font-size:14px">
          <b>本章要点:</b>${esc(c.bottomLine)}
        </p>
        <p style="margin-top:8px;font-size:13px;color:var(--muted)">💡 ${esc(c.tip)}</p>
      </section>
    `;
  },

  // 渲染单页幻灯片(给演示模式用)
  renderSlide: function (chapter, currentIdx, total) {
    return `
      <div class="slide-inner">
        <div class="slide-head">
          <span class="slide-num">第 ${chapter.id} / ${total} 章</span>
          <span class="slide-icon">${chapter.icon}</span>
        </div>
        <h1 class="slide-title">${esc(chapter.title)}</h1>
        <p class="slide-hero">${esc(chapter.hero)}</p>
        <div class="slide-points">
          ${chapter.points.map(p => `
            <div class="slide-point">
              <div class="slide-point-tag">${esc(p.tag)}</div>
              <div class="slide-point-desc">${esc(p.desc)}</div>
            </div>
          `).join('')}
        </div>
        <p class="slide-bottom">💡 ${esc(chapter.bottomLine)}</p>
        <p class="slide-tip">${esc(chapter.tip)}</p>
        <div class="slide-foot">
          <span>AI 工具学习平台 · 30 天之旅</span>
          <span>${currentIdx + 1} / ${total}</span>
        </div>
      </div>
    `;
  }
};