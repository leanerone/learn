const db = require('./db');
(async () => { await db.initDb(); })();

const resources = [
  // MCP 教程
  {category:'MCP', title:'《2025 最全 MCP 协议教程》', author:'鱼皮', url:'https://www.bilibili.com/video/BV1xxxxxx', description:'约 1 小时,含写 MCP Server 实战,中文', duration:60, language:'zh', tags:JSON.stringify(['入门','实战'])},
  {category:'MCP', title:'MCP 官方文档', author:'Anthropic', url:'https://modelcontextprotocol.io', description:'协议规范、SDK、Server 列表的官方文档,英文', language:'zh', tags:JSON.stringify(['官方','规范'])},
  {category:'MCP', title:'《MCP Explained in 100 Seconds》', author:'Fireship', url:'https://www.youtube.com/watch?v=inezqNYj', description:'100 秒讲清 MCP 是什么', duration:2, language:'en', tags:JSON.stringify(['入门','科普'])},

  // DSH 教程
  {category:'DSH', title:'《DeepSeek Harness 实战:从入门到插件开发》', author:'B站多个UP', url:'https://www.bilibili.com/search?keyword=DeepSeek%20Harness', description:'约 45 分钟,插件开发实战', duration:45, language:'zh', tags:JSON.stringify(['入门','插件'])},
  {category:'DSH', title:'DeepSeek 官方文档', author:'DeepSeek', url:'https://platform.deepseek.com/docs', description:'API、SDK、最佳实践', language:'zh', tags:JSON.stringify(['官方'])},

  // Codex 教程
  {category:'Codex', title:'《Codex CLI 实战》', author:'B站搜索', url:'https://www.bilibili.com/search?keyword=Codex%20CLI', description:'Codex CLI 命令详解', duration:30, language:'zh', tags:JSON.stringify(['CLI'])},
  {category:'Codex', title:'OpenAI Codex 官方仓库', author:'OpenAI', url:'https://github.com/openai/codex', description:'README 是最好的入门', language:'en', tags:JSON.stringify(['官方'])},

  // Copilot 教程
  {category:'Copilot', title:'《GitHub Copilot 全套教程》', author:'B站多个UP', url:'https://www.bilibili.com/search?keyword=Copilot%202025', description:'重点看 Agent 模式 + MCP 配置', duration:60, language:'zh', tags:JSON.stringify(['Agent','MCP'])},
  {category:'Copilot', title:'GitHub Copilot 官方文档', author:'GitHub', url:'https://docs.github.com/copilot', description:'Agent / Edit / Workspace 全在这', language:'en', tags:JSON.stringify(['官方'])},

  // Continue(高敏感备选)
  {category:'Continue', title:'Continue 官方文档', author:'Continue', url:'https://docs.continue.dev', description:'仅当高敏感模块需要本地模型时再翻', language:'en', tags:JSON.stringify(['本地模型'])},

  // MCP Server 仓库
  {category:'MCP', title:'Anthropic MCP Servers 仓库', author:'Anthropic', url:'https://github.com/modelcontextprotocol/servers', description:'官方 MCP Server 列表,直接抄作业', language:'en', tags:JSON.stringify(['官方','源码'])},
];

const quizzes = [
  {category:'AI 基础', question:'下面哪个不属于 AI 工具的"三层分类"?',
   options:JSON.stringify(['对话型(ChatGPT 网页)', '工具型(Copilot 补全)', '智能体型(可自动执行任务)', '数据库型(MySQL)']),
   answer:3, explanation:'AI 工具主要分对话/工具/智能体三层,数据库不是 AI 工具分类'},
  {category:'AI 基础', question:'MCP 的全称是?',
   options:JSON.stringify(['Model Calling Protocol', 'Model Context Protocol', 'Machine Control Program', 'Multi-Channel Plugin']),
   answer:1, explanation:'MCP = Model Context Protocol,由 Anthropic 提出的协议标准'},
  {category:'Skill/MCP/Agent', question:'Skill 本质是什么?',
   options:JSON.stringify(['一段提示词 + 工具配置', '一个独立的 AI 模型', 'MCP 的另一种说法', '一个云端服务']),
   answer:0, explanation:'Skill 是把工作流能力封装成"提示词 + 工具"的可复用包'},
  {category:'Skill/MCP/Agent', question:'Agent 模式和普通对话模式的本质区别是?',
   options:JSON.stringify(['更快', '更准确', '能规划多步骤并自动执行', '能联网']),
   answer:2, explanation:'Agent 模式可自主拆解任务、调用工具、循环迭代'},
  {category:'工具对比', question:'你们已经采购的工具是?',
   options:JSON.stringify(['DeepSeek Harness', 'OpenAI Codex', 'GitHub Copilot 企业版', 'Claude']),
   answer:2, explanation:'你们已采购 GitHub Copilot 企业版'},
  {category:'工具对比', question:'以下哪个场景最适合用 Copilot Agent 模式?',
   options:JSON.stringify(['问"今天天气"', '批量重构 10 个文件的命名规范', '搜索文件', '翻译文档']),
   answer:1, explanation:'Agent 模式擅长批量、自动、多步的任务'},
  {category:'合规', question:'半导体厂内使用 Copilot,以下哪个做法不合规?',
   options:JSON.stringify(['选中代码块再问 AI', '把含客户代码的整段贴进 Chat', '用 gitignore 排除敏感目录', '开启审计日志']),
   answer:1, explanation:'把含客户代码 / 工艺参数整段贴进 Chat 会导致数据外传'},
  {category:'MCP 实战', question:'filesystem MCP server 的主要作用是?',
   options:JSON.stringify(['压缩文件', '让 AI 读取本地目录', '同步到云端', '删除文件']),
   answer:1, explanation:'filesystem MCP 让 AI 能列出/读本地文件'},
  {category:'Skill 制作', question:'SKILL.md 文件的核心结构不包括?',
   options:JSON.stringify(['name', 'steps', 'constraints', 'database_url']),
   answer:3, explanation:'SKILL.md 包含 name、description、steps、constraints,不需要数据库 URL'},
  {category:'自动化', question:'cron 任务的最小粒度是?',
   options:JSON.stringify(['秒', '分钟', '小时', '天']),
   answer:1, explanation:'标准 cron 是分钟粒度'},
];

const insertRes = db.prepare(`INSERT INTO resources (category, title, author, url, description, duration, language, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const insertQuiz = db.prepare(`INSERT INTO quiz_questions (category, question, options, answer, explanation) VALUES (?, ?, ?, ?, ?)`);

const seedPromise = (async () => {
  await db.initDb();
  const existingRes = db.prepare('SELECT COUNT(*) as c FROM resources').get();
  if (!existingRes || existingRes.c === 0) {
    for (const r of resources) insertRes.run(r.category, r.title, r.author, r.url, r.description, r.duration||null, r.language, r.tags);
    for (const q of quizzes) insertQuiz.run(q.category, q.question, q.options, q.answer, q.explanation);
    console.log(`✓ 已插入 ${resources.length} 条资源 + ${quizzes.length} 道自检题`);
  } else {
    console.log(`资源表已有 ${existingRes.c} 条,跳过`);
  }
})();

module.exports = {};
module.exports.ready = seedPromise;