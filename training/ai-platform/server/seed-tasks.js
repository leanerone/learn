const db = require('./db');

const tasks = [
  // ========== 第 1 周：概念与入门 ==========
  {day:1, week:1, phase:'AI 工具基础', category:'概念',
   title:'理解 AI 工具的三种形态',
   objective:'能区分"对话型 / 工具型 / 智能体型"三层 AI,不再混淆概念',
   steps:JSON.stringify([
     '打开 DSH,问它:"什么是 AI Agent?",记录它的回答',
     '打开 Codex 网页版 (chatgpt.com/codex),问同样的问题,对比回答',
     '打开 VS Code + Copilot Chat,问同样的问题',
     '把三个回答贴在一起,标出相同点和差异点',
     '在笔记中心写一段 200 字总结:"哪种 AI 适合回答概念,哪种适合做实际工作"'
   ]),
   verification:'不看任何资料,能向别人解释清楚"对话型/工具型/智能体型"三层 AI 的区别',
   deliverable:'笔记中心标题"AI 三层认知"',
   difficulty:'easy', estimated_min:30},

  {day:2, week:1, phase:'AI 工具基础', category:'概念',
   title:'画一张 MCP/Skill/Agent 关系图',
   objective:'用一张纸(或画图工具)把 MCP、Skill、Agent 之间的关系画出来',
   steps:JSON.stringify([
     '在白纸或 Excalidraw (excalidraw.com) 打开空白画布',
     '画 5 个方块:用户 / 模型 / Skill / MCP / 外部工具',
     '用箭头标出数据流向:用户→模型,模型→Skill,Skill→MCP,MCP→外部工具',
     '在每个方块下写一句解释',
     '拍照/截图保存到笔记中心'
   ]),
   verification:'能口述"祖图"中每一层的作用,以及为什么 Skill 需要 MCP 来"打电话"',
   deliverable:'祖图图片上传到笔记',
   difficulty:'easy', estimated_min:25},

  {day:3, week:1, phase:'AI 工具基础', category:'环境',
   title:'安装 DeepSeek Harness(DSH)',
   objective:'成功装上 DSH,能新建一个 AI 对话窗口',
   steps:JSON.stringify([
     '访问 DSH 官网,下载对应系统的安装包(Windows/macOS/Linux)',
     '运行安装包,默认配置一路 Next',
     '打开 DSH,登录账号(用手机号或邮箱)',
     '点击"新建对话",输入"你好,请用一句话介绍你自己"',
     '看到 AI 回复,截图保存'
   ]),
   verification:'DSH 在桌面有图标,点击能启动,新建对话能看到 AI 回复',
   deliverable:'截图到笔记中心"DSH 安装完成"',
   difficulty:'easy', estimated_min:30},

  {day:4, week:1, phase:'AI 工具基础', category:'环境',
   title:'安装 VS Code + GitHub Copilot',
   objective:'你们已购买 Copilot 企业版,本任务把它激活',
   steps:JSON.stringify([
     '打开 VS Code,左侧扩展栏搜索 "GitHub Copilot"',
     '点 Install,装好后重启 VS Code',
     '右下角弹出 "Sign in to GitHub",点 Sign in',
     '用公司提供的 GitHub 账号登录(企业 SSO)',
     '登录成功后,新建 .py 文件,输入 "def hello(",观察 AI 自动建议'
   ]),
   verification:'VS Code 中输入 Python 函数定义时,能看到 Copilot 的灰色提示',
   deliverable:'截图到笔记中心"Copilot 已激活"',
   difficulty:'easy', estimated_min:25},

  {day:5, week:1, phase:'AI 工具基础', category:'环境',
   title:'安装 Codex CLI',
   objective:'能在终端里调用 Codex',
   steps:JSON.stringify([
     '打开 VS Code 内置终端(Ctrl+`)',
     '运行: npm i -g @openai/codex',
     '运行: codex --version,看到版本号说明 OK',
     '运行: codex,首次会自动打开浏览器登录',
     '登录后回到终端,输入 "explain this directory",看 AI 输出'
   ]),
   verification:'在任意项目目录下运行 codex,能获得 AI 回复',
   deliverable:'终端截图到笔记"Codex CLI 安装成功"',
   difficulty:'medium', estimated_min:30},

  {day:6, week:1, phase:'AI 工具基础', category:'实操',
   title:'用三种工具问同一个 EAP 问题',
   objective:'对比三个工具在专业问题上的差异',
   steps:JSON.stringify([
     '选一个真实 EAP 问题(比如"SECS-II S6F11 事件怎么订阅?")',
     '在 DSH 中问,记录回答',
     '在 Copilot Chat 中问,记录回答',
     '在 Codex CLI 中问,记录回答',
     '对比三个回答:谁最准确?谁给了示例代码?谁更简洁?'
   ]),
   verification:'有一张对比表,记录三工具在专业问题上的差异',
   deliverable:'笔记"三工具首次对比"',
   difficulty:'easy', estimated_min:30},

  {day:7, week:1, phase:'AI 工具基础', category:'复习',
   title:'第 1 周复盘',
   objective:'完成第 1 周的所有打卡',
   steps:JSON.stringify([
     '回到今日任务页,检查 1-6 天是否全部打勾',
     '查看进度页,本周完成率应为 100%',
     '去自检题页面,答 5 道关于 AI 基础概念的题',
     '在笔记中心写一段本周心得'
   ]),
   verification:'本周完成率 100%,自检题正确率 >= 80%',
   deliverable:'笔记"第 1 周复盘"',
   difficulty:'easy', estimated_min:20},

  // ========== 第 2 周：Skill 制作 ==========
  {day:8, week:2, phase:'Skill 与插件', category:'Skill',
   title:'在 DSH 中安装第一个官方插件',
   objective:'理解插件机制,装好至少 3 个官方推荐插件',
   steps:JSON.stringify([
     '打开 DSH → 设置 → 插件市场',
     '搜索"@deepseek/web-search",安装并启用',
     '搜索"@deepseek/file-reader",安装',
     '搜索"@deepseek/code-exec",安装',
     '新建对话,问"今天上海天气",验证 web-search 生效'
   ]),
   verification:'在对话中能用上至少 3 个官方插件的能力',
   deliverable:'截图到笔记"DSH 插件安装"',
   difficulty:'medium', estimated_min:35},

  {day:9, week:2, phase:'Skill 与插件', category:'Skill',
   title:'创建你的第一个 Skill:secs-log-analyzer',
   objective:'掌握 Skill 的目录结构和 SKILL.md 写法',
   steps:JSON.stringify([
     '在本地创建目录:~/skills/secs-log-analyzer/',
     '在目录下创建 SKILL.md 文件',
     '复制课件中的模板,改成"分析 SECS 日志并给出报警根因"',
     '在 DSH 中加载这个本地 Skill',
     '测试:丢一段 SECS 日志给它,看是否按你定义的格式输出'
   ]),
   verification:'自定义 Skill 能被 DSH 识别并按预期工作',
   deliverable:'截图 + SKILL.md 内容到笔记',
   difficulty:'medium', estimated_min:45},

  {day:10, week:2, phase:'Skill 与插件', category:'Skill',
   title:'升级 Skill:加入工作流约束',
   objective:'让 Skill 知道该按什么顺序思考',
   steps:JSON.stringify([
     '打开昨天的 SKILL.md',
     '在 steps 部分增加"先看告警码 → 查 SECS 协议 → 给根因"的三步流程',
     '在 constraints 部分增加"不允许修改原始日志"',
     '在 DSH 中重新加载,测一个真实报警场景',
     '对比昨天的输出,看是否更结构化'
   ]),
   verification:'Skill 输出包含明确的"分析步骤",而不仅仅是直接结论',
   deliverable:'更新后的 SKILL.md',
   difficulty:'medium', estimated_min:40},

  {day:11, week:2, phase:'Skill 与插件', category:'MCP',
   title:'配置 filesystem MCP Server',
   objective:'让 AI 能读你电脑上的本地文件',
   steps:JSON.stringify([
     '在 DSH 配置目录找到 mcp.json(或类似文件)',
     '添加 filesystem server,参数指向 ~/skills',
     '重启 DSH',
     '在对话中说"读一下我 skills 目录里有哪些文件"',
     'AI 准确列出文件 → 成功'
   ]),
   verification:'AI 能列出本地文件系统的目录内容',
   deliverable:'mcp.json 配置截图',
   difficulty:'medium', estimated_min:35},

  {day:12, week:2, phase:'Skill 与插件', category:'MCP',
   title:'配置 github MCP Server',
   objective:'让 AI 能直接查/改 GitHub 仓库',
   steps:JSON.stringify([
     '去 GitHub Settings → Developer settings → Personal access tokens',
     '新建一个 fine-grained token,只勾选 repo 权限',
     '把 token 复制到 DSH 的 mcp.json',
     '重启 DSH',
     '说"列出我的 github 仓库",验证生效'
   ]),
   verification:'AI 能直接调用 GitHub API,不需要手动复制粘贴',
   deliverable:'mcp.json 中 github 配置部分',
   difficulty:'hard', estimated_min:45},

  {day:13, week:2, phase:'Skill 与插件', category:'实操',
   title:'用 SECS Skill 分析一段真实日志',
   objective:'把 Skill 用到你的实际工作中',
   steps:JSON.stringify([
     '找一段最近的 SECS 日志(从 EAP 系统的 log 文件中复制)',
     '用昨天创建的 secs-log-analyzer Skill',
     '让 AI 输出:1) 告警码 2) 触发设备 3) 根因 4) 建议处理',
     '把 AI 输出存档到笔记',
     '和真实值班记录对比,看是否一致'
   ]),
   verification:'AI 输出格式符合你的预期,可以作为值班辅助',
   deliverable:'分析结果截图',
   difficulty:'hard', estimated_min:60},

  {day:14, week:2, phase:'AI 工具基础', category:'复习',
   title:'第 2 周复盘',
   objective:'完成第 2 周的所有打卡',
   steps:JSON.stringify([
     '检查 8-13 天全部打勾',
     '查看进度页,本周完成率应为 100%',
     '去自检题页面,答 5 道关于 Skill/MCP 的题',
     '在笔记中心写一段:你现在的 secs-log-analyzer Skill 还能加什么'
   ]),
   verification:'本周完成率 100%,自检题正确率 >= 80%',
   deliverable:'笔记"第 2 周复盘"',
   difficulty:'easy', estimated_min:25},

  // ========== 第 3 周：Codex CLI + Agent 模式 ==========
  {day:15, week:3, phase:'Codex 与 Agent', category:'Codex',
   title:'Codex CLI 基础命令',
   objective:'掌握 5 个最常用的 Codex CLI 命令',
   steps:JSON.stringify([
     'cd 到一个测试项目目录',
     'codex "explain this file" - 解释当前文件',
     'codex "find all TODO comments" - 搜索 TODO',
     'codex "add docstring to all functions" - 自动加注释',
     'codex "run tests" - 执行测试',
     'codex --help - 看所有命令'
   ]),
   verification:'能熟练使用 5 个以上 Codex CLI 子命令',
   deliverable:'命令截图合集',
   difficulty:'medium', estimated_min:40},

  {day:16, week:3, phase:'Codex 与 Agent', category:'Codex',
   title:'用 Codex 写一个完整小工具',
   objective:'从需求到代码,完整走一遍',
   steps:JSON.stringify([
     '确定一个需求:"写一个 Python 脚本,读 CSV 文件并统计每列缺失值"',
     '在 Codex 中输入这个需求,看它给的代码',
     '复制到本地,运行,看是否一次通过',
     '如果报错,把错误贴回 Codex,让它改',
     '直到脚本能正确运行'
   ]),
   verification:'你从无到有做出了一个能跑的小工具',
   deliverable:'脚本文件 + 运行截图',
   difficulty:'medium', estimated_min:45},

  {day:17, week:3, phase:'Codex 与 Agent', category:'Copilot',
   title:'激活 Copilot Agent 模式',
   objective:'在 VS Code 中切换到 Agent 模式,完成一个真实任务',
   steps:JSON.stringify([
     '在 VS Code 右侧 Copilot 图标下拉,选 "Agent"',
     '输入:"帮我在 src/utils/ 下新建 string_helper.ts,提供 5 个常用字符串处理函数"',
     '观察 AI 是否自动创建文件 + 写代码 + 解释',
     '点击 Apply 应用修改',
     '运行测试,验证'
   ]),
   verification:'Agent 模式能自动完成"创建文件 + 写代码 + 测试"全流程',
   deliverable:'截图到笔记"Copilot Agent 第一次任务"',
   difficulty:'medium', estimated_min:40},

  {day:18, week:3, phase:'Codex 与 Agent', category:'Copilot',
   title:'Agent 模式做批量重构',
   objective:'用 Agent 一次性改 10+ 个文件',
   steps:JSON.stringify([
     '找一个项目,里面有 5 个以上 .java 文件用了旧版 log4j',
     '用 Agent 输入:"把项目里所有 log4j 替换为 slf4j,确保 import 正确"',
     '观察 AI 是否:1)列出所有改动文件 2)给出 diff 3)等你 Apply',
     '点击 Apply,运行 mvn compile',
     '如有报错,继续让 Agent 修复'
   ]),
   verification:'10+ 文件批量重构成功,编译通过',
   deliverable:'git diff 截图',
   difficulty:'hard', estimated_min:60},

  {day:19, week:3, phase:'Codex 与 Agent', category:'实操',
   title:'EAP 单元测试覆盖率提升',
   objective:'给项目加 JaCoCo 测试覆盖',
   steps:JSON.stringify([
     '打开你的 EAP 项目',
     '用 Agent:"给 com.example.eap.service 包下所有类生成 JUnit 5 测试,覆盖正常路径和边界条件"',
     'Agent 会生成 N 个测试类',
     '运行 mvn test,看覆盖率',
     '如覆盖率 < 60%,继续要求"再补一些边界条件测试"'
   ]),
   verification:'单元测试覆盖率 >= 60%',
   deliverable:'覆盖率报告截图',
   difficulty:'hard', estimated_min:90},

  {day:20, week:3, phase:'Codex 与 Agent', category:'MCP',
   title:'给 Copilot 装 filesystem MCP',
   objective:'让 Copilot 能读你 D 盘的项目',
   steps:JSON.stringify([
     '在项目根目录创建 .vscode/mcp.json',
     '配置 filesystem server 指向你的项目目录',
     '重启 VS Code',
     '在 Copilot Chat 输入:"读 D:/eap-project 下所有 README,告诉我这个项目的结构"',
     '验证 AI 是否能直接读取'
   ]),
   verification:'Copilot 能读指定目录下的所有文件',
   deliverable:'mcp.json + 截图',
   difficulty:'medium', estimated_min:35},

  {day:21, week:3, phase:'AI 工具基础', category:'复习',
   title:'第 3 周复盘',
   objective:'完成第 3 周所有任务',
   steps:JSON.stringify([
     '检查 15-20 天全部打勾',
     '去自检题页面答 5 道 Agent 相关题',
     '写笔记"第 3 周复盘":Agent 模式改变了你的哪些工作习惯'
   ]),
   verification:'本周完成率 100%,自检题 >= 80%',
   deliverable:'笔记',
   difficulty:'easy', estimated_min:25},

  // ========== 第 4 周：自动化工作流 ==========
  {day:22, week:4, phase:'自动化工作流', category:'Automation',
   title:'用 Codex CLI 写定时任务',
   objective:'写一个每天自动跑的脚本',
   steps:JSON.stringify([
     '在 ~/skills/ 创建 morning-report.md(用 Skill 语法)',
     'def bash_script: 拉昨天 EAP 报警、按 group by 统计、写到文件',
     '写一个 cron: 每天 8:00 自动执行 codex + 这个 Skill',
     '等待第二天,看是否自动产出报告',
     '如不成功,查 Codex 日志,排查'
   ]),
   verification:'每天 8 点自动生成昨日报警统计报告',
   deliverable:'cron 配置 + 报告截图',
   difficulty:'hard', estimated_min:60},

  {day:23, week:4, phase:'自动化工作流', category:'Automation',
   title:'构建日报 Skill',
   objective:'把日报做成可重复使用的 Skill',
   steps:JSON.stringify([
     '创建 daily-report Skill',
     '输入:"请用以下数据生成今日 EAP 值班日报:1) 今日报警 2) 处理情况 3) 遗留问题"',
     '要求 AI 按固定格式输出 Markdown',
     '把这个 Skill 嵌入到昨天 cron 任务里',
     '第二天看自动产出的日报是否'
   ]),
   verification:'自动日报格式统一,可直接发群',
   deliverable:'Skill 文件 + 一份自动日报',
   difficulty:'hard', estimated_min:60},

  {day:24, week:4, phase:'自动化工作流', category:'Automation',
   title:'Code Review Agent',
   objective:'用 Codex 做自动 Code Review',
   steps:JSON.stringify([
     '在项目中开一个测试 PR',
     '配置 GitHub Actions: PR 触发时运行 codex review',
     'Codex 自动给出 review 意见(行级评论)',
     '实际跑一次,看 review 质量',
     '根据结果调整 review Skill 的提示词'
   ]),
   verification:'PR 提交后 30 秒内自动收到 AI Code Review 意见',
   deliverable:'GitHub Actions 配置 + Review 截图',
   difficulty:'hard', estimated_min:75},

  {day:25, week:4, phase:'自动化工作流', category:'Automation',
   title:'构建完整的值班助理',
   value:'把前面所有 Skill 串成一个"虚拟值班员"',
   objective:'组合多个 Skill 做一个完整的值班助理',
   steps:JSON.stringify([
     '创建 on-duty Skill,包含以下流程:',
     '1) 收到 SECS 报警(用 secs-log-analyzer)',
     '2) 自动查询相关 SOP(用 file-reader)',
     '3) 生成值班日报(用 daily-report)',
     '4) 发送到值班群(用企业微信 webhook)',
     '用一个 mock 数据走通全流程'
   ]),
   verification:'给定一段报警,自动产出 → SOP 建议 → 日报 → 发送到群',
   deliverable:'完整 on-duty Skill 文件 + 一次端到端截图',
   difficulty:'hard', estimated_min:90},

  {day:26, week:4, phase:'自动化工作流', category:'分享',
   title:'把"祖图"讲解给一位同事',
   objective:'能给别人讲明白 MCP/Skill/Agent',
   steps:JSON.stringify([
     '邀请一位同事(15 分钟)',
     '用 PPT 模式打开本文第 2 节',
     '讲解 MCP/Skill/Agent 三者关系',
     '回答同事的问题',
     '记录同事的疑问,看是否补足你的理解'
   ]),
   verification:'同事能复述你讲的"祖图"',
   deliverable:'讲解时同事的反馈记录',
   difficulty:'medium', estimated_min:30},

  {day:27, week:4, phase:'自动化工作流', category:'分享',
   title:'给同事讲一次 DSH 插件开发',
   objective:'带同事走一遍 "建 Skill" 流程',
   steps:JSON.stringify([
     '邀请 1-2 位同事(30 分钟)',
     '现场带他们建一个 hello-world Skill',
     '让他们自己改一次提示词',
     '让他们提交到 DSH',
     '总结常见问题'
   ]),
   verification:'至少 1 位同事能独立建一个新 Skill',
   deliverable:'现场截图 + 同事反馈',
   difficulty:'medium', estimated_min:45},

  {day:28, week:4, phase:'自动化工作流', category:'分享',
   title:'做一份部门内部"AI 工具速查卡"',
   objective:'把知识固化成可传阅的资料',
   steps:JSON.stringify([
     '打开本课件第 6 节',
     '整理出"何时用 DSH / 何时用 Codex / 何时用 Copilot"的速查表',
     '加 EAP 常见任务的提示词模板(5 个)',
     '用本课件的"打印讲义"模式,导出 PDF',
     '发到部门群'
   ]),
   verification:'部门群有人下载并反馈使用',
   deliverable:'PDF 速查卡',
   difficulty:'medium', estimated_min:60},

  {day:29, week:4, phase:'自动化工作流', category:'复习',
   title:'总复盘',
   objective:'完成 30 天全部任务',
   steps:JSON.stringify([
     '进度页检查: 1-28 天全部打勾',
     '去自检题,答 20 道总复习题',
     '在笔记写"30 天学习总结": 最大的收获 / 还需精进的点 / 下一个 30 天计划',
     '给自己发一个完成证书(用本课件导出)'
   ]),
   verification:'30 天完成率 100%, 自检题 >= 85%',
   deliverable:'30 天学习总结 + 证书',
   difficulty:'easy', estimated_min:45},

  {day:30, week:4, phase:'自动化工作流', category:'进阶',
   title:'规划下一个 30 天',
   objective:'从"会用"走向"能造"',
   steps:JSON.stringify([
     '回顾 30 天学习笔记,识别你最需要的工具(深入)',
     '可选方向: 1) 自建 MCP Server 2) 自建 DSH Skill 商店 3) Agent 编排多步骤工作流',
     '在笔记中心写"下一个 30 天计划"',
     '设置每月一次复盘提醒'
   ]),
   verification:'有清晰的下一阶段学习目标',
   deliverable:'下一个 30 天计划',
   difficulty:'medium', estimated_min:30},
];

const insert = db.prepare(`INSERT INTO tasks (day, week, phase, category, title, objective, steps, verification, deliverable, difficulty, estimated_min) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const seedPromise = (async () => {
  await db.initDb();
  const existing = db.prepare('SELECT COUNT(*) as c FROM tasks').get();
  if (!existing || existing.c === 0) {
    for (const r of tasks) {
      insert.run(r.day, r.week, r.phase, r.category, r.title, r.objective, r.steps, r.verification, r.deliverable, r.difficulty, r.estimated_min);
    }
    console.log(`✓ 已插入 ${tasks.length} 条任务`);
  } else {
    console.log(`任务表已有 ${existing.c} 条,跳过`);
  }
})();

module.exports = tasks;
module.exports.ready = seedPromise;