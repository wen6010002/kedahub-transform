# 课搭「结果型成长社区」转型：AI Agent 技术调研报告

调研日期：2026-09-13。所有价格为检索时点价格（已标注时效），国产模型价格变动频繁，落地前以官方价格页复核为准。汇率按 1 USD ≈ 7.2 CNY 估算。

---

## 1. 执行摘要（TL;DR）

**核心判断：课搭的四类 AI 能力，没有一类需要"自主多 Agent 系统"。** 路线生成本质是"模板检索 + 参数化决策 + 结构化 patch 输出"，验收初评是"rubric-based LLM-as-judge"，答疑是"grounded RAG"。这是 Anthropic 在《Building Effective Agents》里反复强调的原则——从最简单的工作流开始，只在有可验证收益时才升级复杂度。框架选型的关键不是"哪个 Agent 框架最强"，而是"结构化输出 + 校验重试 + 人工兜底"这三件事是否做扎实。

**五条明确推荐：**

1. **主框架：Vercel AI SDK v5/v6（TypeScript）。** 课搭已是 Next.js 14 + TS 全栈，AI SDK 的 `generateObject` + Zod schema 是"模板约束式个性化调整"的最短实现路径；`stopWhen`/`prepareStep` 原生支持无 chat UI 的 agent loop，与"隐藏式 Agent"产品形态天然契合。不引入第二语言的主链路。
2. **架构原则：LLM 输出"对模板的操作指令（patch）"，不输出"内容本身"。** 路线的全部资源/任务/验收标准来自人工验证的模板库（带唯一 ID），LLM 只决定选哪个模板、砍哪个阶段、加哪个前置模块、时长调多少——schema 中资源引用用 enum 白名单（只能是库内 ID），从机制上消灭"编造不存在的资源"这类幻觉。这是"retrieval + constrained generation"最可靠的落地方式。
3. **求职第二曲线：把"验收评估链路"用 Spring AI Alibaba Graph 做一个 Java 版服务。** 作者熟悉 Spring AI Alibaba、正在找 AI Agent 岗；Graph 的状态机 + HITL + checkpoint 与验收链路（AI 初评 → 学长终审）天然同构，1.0 GA（2025-06）后已生产可用。这样简历上同时有 TS 生产链路和 Java Agent 编排两条叙事。
4. **模型分层（2026 中国可商用）：** 路线生成与验收初评用 **GLM-4.6 或 qwen3-plus**（中档，约 ¥2.5/¥10 和 ¥0.8/¥2 每百万 token 输入/输出）；日常答疑用 **qwen-flash / deepseek-flash**（低档）；疑难重评与路线质检 judge 可选 **Claude Sonnet 5**（$2/$10，约 ¥14/¥72，需合规通道）或 qwen3-max。**单次路线生成成本约 ¥0.01–0.06**，300 活跃用户月度 AI 成本估算在 ¥200 以内——成本不是瓶颈，学长时间才是。
5. **隐藏式 Agent 的红线：AI 永远不直接面向用户输出，永远有非 AI 兜底。** 参照 Notion AI 的"context over chat"设计与 ambient AI 模式：用户看到的是进度条、结果卡片和可编辑的路线页；AI 失败时静默降级为纯模板路线 + 人工学长跟进。翻车案例（教师发现不了 AI 评分错误、Ofqual 明确反对通用 AI 评分）都指向同一结论：AI 初评只能做"pre-fill"，分数生效权留给人工。

---

## 2. Agent 框架格局与对比（2025–2026）

### 2.1 对比表

| 框架 | 语言/版本现状 | 核心抽象 | 结构化输出 | HITL | 记忆 | 成熟度与社区 | 许可 | 对课搭的适配度 |
|---|---|---|---|---|---|---|---|---|
| **LangGraph**（含 LangGraph.js） | Python/JS 双版本，2025 年末发布 1.0 stable；Klarna、Uber、LinkedIn、GitLab 生产使用 | 低级 StateGraph（节点/边/条件路由，Pregel 风格），"非常低层，专注 agent 编排" | JS 版自带校验弱（"bring your own"） | 一等公民 `interrupt()` + checkpointer，官方文档称"最大控制力"；状态可持久化、失败可恢复 | thread 内 checkpoint + Store（跨 thread namespace，如 `(memories, user_id)`） | 生产案例最多、社区最大；配 LangSmith 可观测 | MIT | 中。能力最全但对我们的任务是重武器；若未来链路复杂化（多轮人机协作编排）是首选升级方向 |
| **Vercel AI SDK v5/v6** | TS 原生；v5 发布于 2025-07-31，v6 已发布（Agent 从 class 改为 interface，迁移成本低） | `generateText`/`generateObject`/`streamObject` + tool calling；v5 起有 `Agent` 抽象、`stopWhen`（工具循环）、`prepareStep`（逐步换模型/压缩上下文） | `generateObject`/`streamObject` 原生 Zod/Valibot/ArkType schema，跨 provider 统一 | 无内置 checkpoint（自己用 DB + 队列实现） | 无内置长期记忆（自己接） | TS 生态事实标准，Next.js 官方亲儿子；AI SDK 3.0 起支持 generative UI（streamObject + RSC） | Apache 2.0 | **最高**。栈内零新增依赖、结构化输出最顺手、无 chat UI 依赖的 agent loop 原生支持 |
| **Mastra** | TS 原生；2025-07 转 Apache 2.0（此前 ELv2 引发"伪开源"争议），2025-11 出 1.0 beta，其后发布 stable 1.0 | `createWorkflow`/`createStep` 线性编排 + Agent + 内置 memory/MCP/evals/Studio 调试 UI；NextBuild 生产基准 DX 9/10（LangChain 5/10） | 内置 structured output + 三库 schema 校验 | workflow suspend/resume（有但非中心设计） | 内置短/长期记忆（opt-in、可配置） | TS 新锐，Reddit 社区口碑好；对比评测认为"solo/小团队应从 Mastra 起步" | Apache 2.0 + 企业版双许可 | 高（次选）。比 LangGraph.js 好上手，比 AI SDK 多了 workflow/记忆/评估；代价是多一层抽象、社区更年轻 |
| **OpenAI Agents SDK** | Python/JS，2025-03 发布（Swarm 的生产化） | Agent（instructions + tools + handoffs）+ guardrails + tracing；多 agent 两种拼法（agents-as-tools / 直接 handoff） | 原生 structured outputs | 无内置 HITL checkpoint | 无内置长期记忆 | OpenAI 官方、文档清晰；绑定 OpenAI 生态（可换 provider 但体验降级） | MIT | 低-中。课搭主用国产模型，OpenAI 通道不是主路径；其 guardrails 设计思想值得抄 |
| **Spring AI + Spring AI Alibaba** | Spring AI 1.0 GA 2025-05；Spring AI Alibaba 1.0 GA 2025-06-16，1.1.2.0 起支持多 agent 并行、Agent Skills、Graph 并行边聚合 | ChatClient + Advisors（拦截/增强）+ StructuredOutputConverter；**Graph** 是"Java 版 LangGraph"：DAG 编排、预置 LlmNode/ToolNode、HITL、流程快照、Mermaid 可视化 | ChatClient 的 Bean/JSON 结构化转换成熟，配合 resilient recipe（校验重试） | Graph 内置 human-in-the-loop | ChatMemory + 百炼 RAG 集成；生态含 Nacos 注册、Higress 网关、Langfuse 可观测 | Java 生态唯一主流选择，约 100 贡献者；生产案例增长中（也有示例工程稳定性 issue） | Apache 2.0 | **Java 侧最高**。适合做验收评估服务与面试作品；不适合替换课搭 TS 主链路 |
| **Claude Agent SDK** | 2025 年末由 Claude Code SDK 更名而来 | Claude Code harness 库化：内置 Read/Write/Edit/Bash 等工具 + subagents（隔离上下文）+ hooks（生命周期拦截）+ MCP | 支持 structured outputs（含重试限制） | hooks + permissions 体系 | sessions + memory 工具 | 适合"会用电脑的 coding/filesystem agent"；以 CLI 子进程方式运行，部署较重 | 商用 SDK | 低。为通用编码 agent 设计，与课搭业务形态不匹配；但其 subagent/hook 设计模式值得借鉴 |

### 2.2 直接回答："基于模板的约束式个性化调整"选哪个

**这个问题首先要纠偏：它不是一个"编排"问题，是一个"约束生成"问题。** 任务形态拆开看——

1. 选模板：结构化匹配（目标类型 + 问卷字段），甚至可以纯规则；
2. 参数决策：一两次 LLM 调用，输入问卷 + profile + 模板，输出 patch JSON；
3. 校验兜底：Zod safeParse → 错误回喂重试（2–3 次上限）→ 降级纯模板 → 人工抽检。

整个链路里没有"多轮自主决策"、没有"动态工具选择"、没有"复杂拓扑"。LangGraph/SAA Graph 解决的问题（循环、分支、状态恢复、并发编排）在这个任务上没有用武之地；引入它们等于为一次 LLM 调用支付一个框架的学习与运维成本。Anthropic 的模式阶梯（prompt chaining → routing → parallelization → orchestrator-worker → evaluator-optimizer）里，这最多是 **prompt chaining + evaluator-optimizer（一步自检）**。

所以结论是：**Vercel AI SDK 的 `generateObject` + Zod 是最贴合的最小工具集**；Mastra 是"想要 workflow 原语和内置 evals"时的 TS 备选；Spring AI Alibaba Graph 的正确位置不是替换主链路，而是承载"验收评估"这条天然多步、天然 HITL 的链路（详见 3.2），同时作为作者求职的核心技术资产。planner-executor / supervisor 这类多 agent 模式在本产品当前阶段属于明确的过度设计（over-engineering）。

### 2.3 值得抄的设计思想（不论用哪个框架）

- **OpenAI Agents SDK 的 guardrails**：输入/输出双层校验作为 agent 的标准配置，而不是事后补丁；
- **LangGraph 的 `interrupt()` checkpoint**：HITL 不是 UI 功能而是执行语义——暂停点持久化状态，人工处理完再恢复。课搭用 PostgreSQL 状态机自行实现同等语义（见 3.1）；
- **Claude Agent SDK 的 hooks**：在关键节点（工具调用前后、出错时）插入自定义代码——对应到课搭就是"AI 决策落库前后"的审计钩子；
- **AI SDK v5 的 `prepareStep`**：逐步换模型/压缩上下文，正好实现"便宜模型先跑、贵模型把关"的分级调用。

---

## 3. 通用设计模式基线（四类能力共用的地基）

### 3.1 Structured Output 最佳实践

分层保障，缺一不可：

1. **能strict 就 strict。** OpenAI strict structured outputs 用受限解码（constrained decoding）宣称 100% schema 合规；阿里云百炼对 Qwen 支持 JSON Schema 模式（官方称"精确控制输出结构，无需额外验证或重试"）与 JSON Object 模式两档；DeepSeek/GLM 至少支持 JSON mode + function calling（DeepSeek 的 tool_calls 是 OpenAI 兼容格式）。机器学习 mastery 与 Vellum 的对比结论一致：**当"动作"只是格式化时用 structured outputs（更可靠、更低延迟）；当模型需要决定"调不调工具"时才用 function calling**。在不支持 strict schema 的模型上，让模型调用一个 `submit_route_patch` 工具是获得近约束效果的通用技巧（OpenAI Agents SDK 即此思路）。
2. **运行时校验必须存在。** Zod `safeParse` 返回结构化错误描述，把错误信息回喂给模型让它自己修——这是 2025 年社区收敛出的标准 repair loop 模式（agentic-patterns.com 的 schema-validation-retry 模式；LangChain.js 的 `with_structured_output` 在校验失败时不自动重试是已知坑，issue #9426，自己包一层重试）。上限 2–3 次，仍失败走降级。
3. **语义校验在语法校验之后。** schema 合法不等于业务正确：引用的资源 ID 必须在白名单内、阶段时长总和要匹配目标时间、前置依赖不能成环。这些用代码规则校验（见 3.4），不要指望 LLM。
4. **schema 设计面向"决策"而非"内容"。** 输出字段是枚举、数字、ID 引用和短理由，不是长文本。字段越接近枚举，幻觉空间越小。

### 3.2 幻觉控制（路线里不能编造资源）

- **ID 白名单**：schema 中资源引用字段用 enum（后端动态注入当前模板库的全部合法 ID）。模型物理上无法引用库外资源——这是比"提示词里求它别编"可靠一个数量级的机制。
- **grounded generation + citation 必填**：答疑场景输出必须携带来源 ID（历史问答 ID / 资料 ID），无来源则拒答并转人工发帖。RAG 的失败大多转移到检索层（Red Gate 指南），所以检索质量（切分、去重、排名）比生成侧调教更值得投入。
- **结构化数据混合 grounding**：K2View 等实践表明，检索上下文里混入结构化数据（而非只有非结构化文本）能进一步降低幻觉——路线场景里"结构化模板 JSON + 少量说明文本"正是这个形态。

### 3.3 评估（evals）：上线前和上线后

- **golden set 先行**：为路线生成准备 20–50 个"问卷组合 → 期望调整 checklist"的标注集（零基础 Java 目标、有基础保研、目标偏产品等典型画像），每次改 prompt/schema 跑一遍回归。
- **rubric 同时写成功与失败样例**：Pydantic evals 的经验——最好的 rubric 同时规定"什么算成功、什么算失败"，不留给 judge 即兴空间。
- **LLM-as-judge 要先对人工校准**：用人工标注的 20+ 条样本验证 judge 与人的一致率，才允许 judge 规模化使用（Evidently/MonteCarlo 的共识）。趋势是 trajectory 级评估（Agent-as-a-Judge，arXiv 2508.02994），课搭早期不需要。
- **线上：AI 初评与人工终审的分歧率是核心监控指标**。分歧样本回流 golden set，形成数据飞轮——这是"人工学长终审"在架构上的第二重价值。

### 3.4 成本控制

- **prompt caching 是第一杠杆**：路线生成的 prompt 前缀（系统指令 + 模板库 JSON）高度稳定，是理想缓存对象。Anthropic 官方生产数据：Claude Code 缓存命中 92%、成本降 81%（cache read 约 0.1x 价格）；国产侧 GLM 隐式缓存命中约 ¥0.75/M（未命中 ¥2.5/M 的 3 折），Qwen3.6/3.8-Plus 支持 prompt cache 命中计费（约 0.2 元级），DeepSeek 以缓存低价著称（V3.2 时代 cache hit ¥0.2/M；V4 转峰谷定价后高峰缓存价有争议，2026-04 官方又把全系缓存命中价降至首发价 1/10）。工程要点：稳定内容放前缀、易变内容（时间戳、用户字段）放最后，用 `usage.cache_read_input_tokens`（或等价字段）验证命中率。
- **模型分级**：便宜模型做初筛/分类/日常答疑，中档模型做路线决策与验收初评，高档模型只处理低置信度疑难与离线质检。AI SDK 的 `prepareStep` 或自建 router 均可。
- **修不如防**：schema 约束让一次通过率足够高，比"生成后重试修复"省得多——重试一次成本近乎翻倍。

### 3.5 Human-in-the-Loop 的正确形态

LangGraph 的 `interrupt()` 把 HITL 做成一等执行原语；课搭不需要框架也有等价物——**异步 job + 数据库状态机**：`PENDING_AI → AI_DRAFT → (AUTO_VALIDATED | NEEDS_REVIEW) → PUBLISHED`。产品语义上，"正在为你制定专属路线"的进度条 + 完成通知，本质是把这个状态机可视化。验收链路同理：`SUBMITTED → AI_PRE_REVIEW → HUMAN_FINAL → GRADED`。人工环节（学长终审、路线抽检）必须能改写/否决 AI 的全部输出，且界面默认展示 AI 评语作为 pre-fill 而非结论。

---

## 4. 四类 Agent 能力的设计建议

### 4.1 隐藏式路线规划 Agent

**推荐方案：模板库 + LLM 决策 patch 的混合架构（Vercel AI SDK `generateObject` 实现）**

数据与流程：

1. **模板库（人工验证、版本化）**：每个目标（如"Java 后端 → AI 应用开发"）对应一个模板：8 阶段，每阶段含节点列表、资源引用（库内唯一 ID）、任务、验收标准。模板带版本号，路线生成时锁定模板版本，保证可追溯、可复现。
2. **规则引擎先行（确定性调整不劳烦 AI）**：每天可投入时间 < 2h → 减少并行任务数并拉长阶段；目标时间 < 模板默认 → 按比例压缩；这些是确定性规则，代码实现，零成本零幻觉。
3. **LLM 做模糊判断（一次调用）**：输入 = 系统指令（调整规则 + 输出格式）+ 模板 JSON + 问卷结构化数据 + learner profile。输出 schema 是操作指令而非内容：
   ```ts
   RoutePatchSchema = z.object({
     templateId: z.enum([/* 当前目标可选模板 */]),
     operations: z.array(z.discriminatedUnion("op", [
       z.object({ op: z.literal("skipStage"), stageId: StageIdEnum, reason: z.string().max(120) }),
       z.object({ op: z.literal("compressStage"), stageId: StageIdEnum, ratio: z.number().min(0.5).max(0.9) }),
       z.object({ op: z.literal("insertStage"), beforeStageId: StageIdEnum, fromTemplateId: PrepTemplateEnum }),
       z.object({ op: z.literal("insertModule"), intoStageId: StageIdEnum, moduleIds: z.array(ModuleIdEnum) }),
     ])).max(6),  // patch 数量上限，防止过度调整
   })
   ```
   所有 `*Enum` 由后端从模板库动态注入合法值。reason 短文本用于给学长看的审计说明，不直接给用户。
4. **校验与兜底链**：Zod safeParse → 失败回喂错误重试（≤2 次）→ 业务规则校验（时长总和、依赖无环）→ 仍失败静默降级为"规则引擎 + 纯模板"，用户无感知。
5. **HITL**：新目标类型的前 N 条路线强制进学长抽检队列（`NEEDS_REVIEW` 状态），稳定后抽检率降到 5–10%。学长改过的路线作为 golden set 素材。
6. **产品呈现**：进度条 + 完成通知 + 可编辑路线页。可选进阶：AI SDK 的 `streamObject` 让"专属路线"分阶段渐进渲染（generative UI 的思路），强化"正在为你定制"的感知。

**备选**：Mastra workflow（若想要内置 evals/Studio 调试）；LangGraph.js（若链路演化出多轮人机协作）；Spring AI Alibaba Graph 平行实现（学习/面试用途，见 4.2 的说明）。

**理由**：该任务的可贵之处是"输出空间可完全约束"——只要坚持"LLM 出 patch、内容出模板"，可靠性问题就从"祈祷模型不胡说"变成"工程校验"，这是单人可维护性的根本保障。

**风险与对策**：
- LLM 过度调整破坏教学逻辑 → `operations.max(6)` + 规则引擎前置消化大部分确定性调整；
- schema 过复杂导致通过率低 → 拆两步调用（先选模板，再出 patch），每步 schema 更小；
- 用户改问卷重生成 → 幂等设计：同一 (问卷, 模板版本) 缓存生成结果，避免重复计费与结果漂移。

### 4.2 阶段验收评估链路（AI 初评 + 学长终审）

**推荐方案：rubric-based LLM-as-judge，按任务类型分流；Java 侧用 Spring AI Alibaba Graph 承载**

- **代码类任务（两阶段）**：先跑确定性检查（测试用例、构建、lint——课搭 Campus Market 项目已有压测与 CI 经验可复用）→ LLM 输入 = 验收标准 + 学生提交的 diff/关键文件 + 检查结果摘要，输出 = 分维度分数 + 逐条 evidence（引用代码位置）+ 低置信维度标记。AI code review 的既有实践（arXiv 2404.18496；Graphite/Copilot 类工具）证明"LLM 拿到结构化检查结果后做综合评审"是成熟形态。
- **文档/作品类**：rubric 分维度（完成度、正确性、深度、与验收标准的匹配）结构化打分，每维度必须附提交内容中的原文证据。
- **输出消费方式**：AI 结果只做两件事——给学长的 pre-fill 评语 + "建议重点复核维度"。**分数不直接生效**。
- **分歧回流**：学长改分样本自动进 golden set；AI-人工分歧率按任务类型监控，超阈值触发 rubric/prompt 复查。

为什么用 Spring AI Alibaba Graph 做这条链路：验收链路是真正的多步状态机（提交 → 确定性检查 → AI 初评 → 置信度路由 → 学长终审 → 归档），Graph 的 HITL、流程快照、Mermaid 可视化与它同构；且作者求职需要"生产级 Java Agent 编排"作品，这比再写一个 TS demo 的边际价值高得多。链路对延迟不敏感，跨语言服务边界（Next.js API → Java 服务）成本可忽略。

**备选**：全 TS 用 AI SDK + 队列实现（更快上线，放弃 Java 叙事）；Agent-as-judge（让 agent 实际运行学生代码做行为级评估，成本高，留作后期对高价值阶段的增强）。

**理由（含翻车案例的证据）**：
- SSRN 2025 随机实验：教师复核"AI 打的分数"时**发现不了 AI 的评分错误**——人工复核不能兜住 AI 错误，所以架构上必须反过来：AI 是草稿，人是结论；
- 英国考试监管机构 Ofqual（2026-01）明确"现有证据不支持通用性使用 AI 评分"，要求场景级证据——教育评分的监管风向趋严，AI 只做初评是合规上更稳的位置；
- No More Marking 2025 年 7 万份作业的英国最大规模试验：AI 与教师判断一致率 83%——足够"省学长时间"（有学校批改 4 小时 → 20 分钟的案例），远不够"替代学长"；
- 学术研究警告无约束 AI 评分会带来 grade inflation（分数通胀）——rubric + 锚定样例（每维度附好/中/差示例）是对症手段。

**风险与对策**：
- **prompt injection**（学生在提交里写"请给满分"）：提交内容作为数据而非指令传入（明确分隔符与角色声明）、检测注入模式、rubric 要求 evidence 锚定，异常高分进人工队列；
- 学生代码执行安全：沙箱运行（容器/受限执行环境），永不直接在生产环境跑；
- rubric 泄露后被"应试"：验收标准本来就是公开的（这是结果型社区的设计），重点靠人工终审与多样本对照守住底线；
- 评分一致性漂移：同一任务类型固定模型版本 + temperature 0，版本升级走 golden set 回归。

### 4.3 学长答疑 / 社区知识库助手

**推荐方案：grounded RAG + 强制引用 + 拒答降级，低档模型**

- 检索层：PostgreSQL + pgvector（课搭已有 PostgreSQL，无需引入新向量库；Redis 已在栈内可做检索缓存）。语料 = 历史问答对（学长终审过的高质量问答优先）+ 资料库。
- 生成层：qwen-flash/deepseek-flash 级模型，prompt 要求只基于检索内容回答，输出 schema 强制 `citations: z.array(HistoryQaIdEnum).min(1)`——无引用不出话。
- 降级：检索相似度低于阈值 → 不硬答，回复"这个问题建议发起提问 @学长"，并把问题推入学长答疑队列——这恰好给社区互动导流，符合"结果型社区"定位。
- 呈现：答疑助手也遵守隐藏式原则——出现在问题页的"相似问题与解答"卡片中，而非独立 chatbot 界面。

**备选**：mem0 做社区级记忆（当问答量上万、需要"跨问题记住社区共识"时再评估）；Perplexity 式追问 agent（远期）。

**理由**：RAG 失败的主要根源在检索层而非生成层（Red Gate 指南；Cleanlab 的评测综述），早期把功夫花在问答数据的结构化沉淀（学长终审时顺手把 QA 对入库打标签）比调生成参数收益大。mem0 论文（arXiv 2504.19413，900+ 引用）解决的是"从对话中动态抽取事实记忆"，与"社区显式知识库"是两个问题，当前阶段不需要。

**风险**：检索质量差 → 冷启动阶段语料少，宁可多拒答转人工，攒语料比攒坏回答重要；引用过期内容（旧版本技术栈）→ 语料带时效标签，过期自动降权。

### 4.4 记忆与学习者建模（动态调整路线）

**推荐方案：自建结构化 learner profile（Prisma 表 + 事件回流），复用 4.1 的 patch 机制做路线动态调整**

- **profile 是结构化学业状态，不是自由文本记忆**：`learner_state`（基础标签、当前阶段、各节点完成态、验收通过率与分维度弱项、活跃节奏、目标变更记录）。每次验收/打卡/目标变更产生事件（event log，可回放），定期（每阶段验收后 + 用户主动触发"重新评估"）由"规则汇总 + LLM 重估"刷新 profile。
- **路线调整与生成共用一条链路**：动态调整 = 新 profile + 当前路线 + 模板 → 同一个 RoutePatch schema。生成与调整是同一个 agent 的两次调用，不是两套系统。
- **借鉴而非引入框架**：LangGraph Store 的 namespace 设计（`("memories", user_id)` 跨会话隔离）和 LangMem 的"用户 profile 维护模式"是好的 schema 参照，但课搭直接用关系表实现——我们的"记忆"维度少、结构强、需要事务一致性（与路线/进度表强关联），向量式语义记忆（mem0 类）反而不合适。答疑对话的短期记忆用 Redis 会话上下文即可。

**备选**：mem0（若未来做"答疑助手记住每个学生的提问历史并个性化"）；知识追踪（knowledge tracing）模型（学术界活跃，但对课搭规模是杀鸡用牛刀，LLM + 规则的轻量版够用）。

**风险**：profile 漂移（一次失误验收把"基础弱"标签焊死）→ 每次重估都基于全量事件而非最新事件，标签带置信度与时效；频繁调整导致用户路线"抖动" → 重大调整（砍阶段/换模块）需用户确认，微调（时长±10%）静默生效。

---

## 5. 模型分层与成本估算（2026 中国可商用视角）

### 5.1 候选模型价格与能力（检索时点，落地前复核官方页）

| 模型 | 输入价（缓存未命中） | 缓存命中 | 输出价 | agent/结构化输出能力 | 备注 |
|---|---|---|---|---|---|
| **GLM-4.6**（智谱） | ~¥2.25–2.5/M（≤32K 档） | ~¥0.75/M（隐式缓存） | ~¥9–10/M | tool calling 与 Claude Code 兼容性好；355B MoE/32B 激活 | 日常编码性价比口碑佳；2026 已有 GLM-4.7-Flash/GLM-5 系列滚动更新，价格体系以 docs.bigmodel.cn 为准 |
| **qwen3-plus**（百炼） | ~¥0.8/M | 支持命中计费 | ~¥2/M | 百炼原生 JSON Schema 模式（官方称免额外校验重试）+ Hermes 风格 tool call（含并行）；BFCL 工具调用榜前列 | 新用户每模型 100 万 token 免费（90 天）；qwen3.8 系列为当前最新档 |
| **qwen3-max** | ~¥2.4/M（2025 大幅降价 88%/84% 后） | 支持 | ~¥9.6/M | 同上，能力档更高 | 重排/疑难场景用 |
| **qwen-flash** | 阶梯计价，低于 plus | 支持 | 低 | 同上 | 日常答疑主力 |
| **deepseek-flash**（V4.1-Flash，官方现价 USD 计） | $0.30/M（高峰）；空闲半价 | $0.006/M | $1.20/M（高峰）；空闲半价 | OpenAI 兼容 tool calls + JSON mode；最大 384K | V3.2 时代（2025-09）曾为 ¥2/M 输入 + ¥0.2/M 缓存的性价比标杆；V4 峰谷定价后高峰缓存价有社区争议，2026-04 官方将全系缓存命中价降至首发价 1/10 |
| **Kimi K2 / K2.5**（月之暗面） | $0.15/M（K2 发布价）；K2.5 ~$0.6/M | K2.5 cache read ~$0.4/M | $2.5/M；K2.5 ~$2.7/M | 1T MoE、主打 agentic 任务，SWE-bench Verified ~65.8% | 输出价偏高，适合 agentic 编码而非高频结构化任务；国内聚合价约 ¥4/¥16 |
| **豆包（火山方舟）** | 约 ¥0.3–9/M 区间（lite→pro 档） | — | 同区间 | 有专门 Function Call 模型（扣子主力模型），参数抽取准确 | 生态绑定火山引擎；价格页 docs.volcengine.com |
| **Claude Sonnet 5** | $2/M（≈¥14.4） | cache read ~0.1x（$0.2/M） | $10/M（≈¥72） | structured outputs + strict tool use；agent 能力第一梯队 | 国内合规通道：AWS Bedrock / Google Vertex（配置门槛高）；中转站价格约官方 5–9 折且有稳定性/合规风险（虎嗅调查；OpenRouter 约等于官方价 + 5.5% 手续费）。适合内部质检工具，不适合用户侧主链路 |
| **Claude Haiku 4.5** | $1/M（≈¥7.2） | ~0.1x | $5/M（≈¥36） | 同上（轻量档） | 可作 LLM-as-judge 的低成本档 |

选型注记：国产四家（DeepSeek/Qwen/GLM/Kimi）均支持 OpenAI 兼容接口与 function calling，Qwen 在百炼上唯一明确提供 JSON Schema 严格模式，GLM 缓存折扣与工具调用稳定性口碑最好，DeepSeek 输入侧最便宜但输出价一般。Claude/GPT 官方直连在国内存在网络与支付门槛，生产用户侧链路不建议依赖；作为开发期内部工具（路线质检、judge 校准）性价比可接受。

### 5.2 分层用模建议

| 层 | 场景 | 首选 | 理由 |
|---|---|---|---|
| **L0 免费/试错** | 开发期全链路调试 | qwen 新用户免费额度 + GLM 体验额度 | 零成本跑通 schema 与 prompt |
| **L1 低档** | 日常答疑、意图分类、验收置信度预筛 | qwen-flash 或 deepseek-flash | 单次 <¥0.01，延迟低 |
| **L2 中档主力** | 路线生成/调整 patch、验收初评 | GLM-4.6 或 qwen3-plus | 结构化输出稳定、成本约 Claude 的 1/10~1/20 |
| **L3 高档（可选）** | 低置信度验收重评、路线质检 judge、离线 golden set 评估 | Claude Sonnet 5（合规通道）或 qwen3-max / Kimi K2.5 | 只处理长尾，调用量小；Claude 仅内部工具用途 |

### 5.3 单次路线生成成本估算

假设：输入 = 系统指令与调整规则 ~2K + 模板 JSON ~7K + 问卷与 profile ~1K ≈ **10K input tokens**；输出 = patch JSON ~2.5K output tokens（含审计 reason）。

| 模型 | 输入成本 | 输出成本 | 单次合计 | 1000 次 |
|---|---|---|---|---|
| qwen3-plus | 10K×¥0.8/M = ¥0.008 | 2.5K×¥2/M = ¥0.005 | **≈¥0.013** | ¥13 |
| GLM-4.6（无缓存） | 10K×¥2.5/M = ¥0.025 | 2.5K×¥10/M = ¥0.025 | **≈¥0.05** | ¥50 |
| GLM-4.6（前缀 8K 缓存命中） | 8K×¥0.75/M + 2K×¥2.5/M ≈ ¥0.011 | ¥0.025 | **≈¥0.036** | ¥36 |
| deepseek-flash（高峰，USD×7.2） | ¥0.022 | ¥0.022 | **≈¥0.043**（空闲 ≈¥0.022） | ¥43（空闲 ¥22） |
| qwen3-max | ¥0.024 | ¥0.024 | **≈¥0.048** | ¥48 |
| Kimi K2 | ¥0.011 | ¥0.045 | **≈¥0.056** | ¥56 |
| Claude Sonnet 5 | ¥0.144 | ¥0.180 | **≈¥0.32** | ¥324 |

（缓存策略提示：模板库 JSON 是稳定前缀，命中率可以做到 80%+，上表 GLM 缓存行即按 8K 命中估算；prompt 组装时务必"稳定内容在前、用户变量在后"。）

其他两类场景单价估算：

- **验收初评（GLM-4.6）**：输入 ~8K（rubric 1K + 验收标准 1K + 提交摘录 6K）+ 输出 ~1.5K ≈ **¥0.035/次**；代码类多 2K 检查结果 ≈ ¥0.04/次。
- **日常答疑（qwen-flash）**：输入 ~3K（系统 + 检索片段）+ 输出 ~0.8K ≈ **¥0.002–0.006/次**。

### 5.4 月度成本情景（300 活跃用户/月）

人均：路线生成 2 次（¥0.10）+ 阶段动态调整 4 次（¥0.05）+ 验收 8 次（¥0.28）+ 答疑 60 次（¥0.30）≈ **¥0.7/人/月**，300 人 ≈ **¥210/月**；叠加缓存优化与 L1 分流可压到 ¥100–150/月。结论：**AI 成本对课搭是完全非瓶颈项**（一台最低配云服务器的零头），真正的稀缺资源是学长的终审时间——所有架构选择（AI 初评定位为 pre-fill、分歧回流、抽检队列）都应围绕"放大学长时间"设计。

---

## 6. 隐藏式 Agent 产品模式（业界经验）

- **Notion AI 是标杆案例**：设计团队明确选择"context over chat"——AI 以上下文动作（划选 → AI 操作、行内续写）出现在创作流中，而非默认聊天窗；其设计负责人 Randy Hunt 对 Fortune 表述"不能让每个新工具都朝你尖叫"（quiet approach）。对课搭的映射：路线页上的"根据我的近况调整"按钮，比一个"AI 助手"入口更符合产品气质。
- **ambient AI 设计模式**（2025–2026 的设计共识）：最好的 AI 界面"看起来不像 AI"——无 prompt 框、无对话流，AI 在后台基于上下文行动，前台只有结果与轻量状态指示。课搭的"正在为你制定专属路线"进度条正是标准的 ambient 模式。
- **"invisible AI trap"（Optimizely 的反方提醒）**：隐形 AI 在成功时是魔法，在失败时是不可解释的黑箱——用户不知道"为什么我的路线这样"。对策：结果可编辑（路线页就是编辑器）+ 轻量归因（"基于你填写的零基础与每天 2 小时，为你加入了前置阶段"——这段话由规则模板渲染 patch reason，不用 LLM 现编）+ 失败有兜底（人工学长跟进）。
- **Duolingo 的双例**：AI 用于后台课程生产（12 个月产出 148 门课，CTO 公开分享）与嵌入式功能（Explain My Answer：答错后的 AI 讲解，嵌在题目反馈里）——两个方向都是"AI 作为能力的供给与增强，不作为产品门面"。课搭的模板库冷启动（AI 辅助学长起草模板 + 人工验证入库）可直接类比。
- **对"不强调 AI"的补充论证**：教育评分场景的监管与舆论敏感（Ofqual 立场、教师工会反对、家长对 AI 评分的信任问题）意味着"AI 后置、人工前置"不仅是产品审美，也是信任策略——课搭把"学长终审"放在台前，恰好踩在这个共识上。

---

## 7. 参考资料

**框架格局与对比**
- Langfuse: Comparing Open-Source AI Agent Frameworks — https://langfuse.com/blog/2025-03-19-ai-agent-comparison
- LangChain: The Best AI Agent Frameworks — https://www.langchain.com/resources/ai-agent-frameworks
- Speakeasy: LangChain vs LangGraph vs CrewAI vs PydanticAI vs Mastra — https://www.speakeasy.com/blog/ai-agent-framework-comparison
- Developers Digest: Mastra vs LangGraph.js (2026) — https://www.developersdigest.tech/blog/mastra-vs-langgraph-js-2026
- Generative.inc: Mastra Complete Guide (2026，含 NextBuild DX 基准) — https://www.generative.inc/mastra-ai-the-complete-guide-to-the-typescript-agent-framework-2026
- Mastra 官网 — https://mastra.ai/ ；Mastra 1.0 发布 — https://mastra.ai/blog/announcing-mastra-1 ；许可证说明 — https://mastra.ai/docs/license
- Mastra ELv2 争议: HN 讨论 — https://news.ycombinator.com/item?id=43103073 ；GitHub issue #2833 — https://github.com/mastra-ai/mastra/issues/2833
- Vercel AI SDK 5 发布博客 — https://vercel.com/blog/ai-sdk-5 ；AI SDK 6 — https://vercel.com/blog/ai-sdk-6
- AI SDK 结构化输出文档 — https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- AI SDK 3.0 generative UI — https://vercel.com/blog/ai-sdk-3-generative-ui
- OpenAI Agents SDK 文档 — https://openai.github.io/openai-agents-python/agents/ ；发布公告 — https://openai.com/index/new-tools-for-building-agents/
- Claude Agent SDK 概览 — https://code.claude.com/docs/en/agent-sdk/overview
- Spring AI Alibaba 官网 — https://java2ai.com/ ；1.0 GA 发布 — https://java2ai.com/blog/spring-ai-alibaba-1.0-ga-release ；1.1.2.0 发布 — https://java2ai.com/blog/saa-1120-release
- Spring AI Advisors API — https://docs.spring.io/spring-ai/reference/api/advisors.html ；Resilient Structured Output — https://thetalkingapp.medium.com/spring-ai-recipe-enabling-resilient-structured-output-5ea7cc20f651

**设计模式与结构化输出**
- Anthropic: Building Effective Agents — https://www.anthropic.com/engineering/building-effective-agents
- Anthropic: Demystifying Evals for AI Agents — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Agenta: Structured Outputs & Function Calling 指南 — https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms
- MachineLearningMastery: Structured Outputs vs Function Calling — https://machinelearningmastery.com/structured-outputs-vs-function-calling-which-should-your-agent-use/
- Vellum: Function Calling vs Structured Outputs vs JSON Mode — https://www.vellum.ai/blog/when-should-i-use-function-calling-structured-outputs-or-json-mode
- Schema Validation Retry 模式 — https://agentic-patterns.com/patterns/schema-validation-retry-cross-step-learning/
- LangChain.js with_structured_output 不重试 issue — https://github.com/langchain-ai/langchainjs/issues/9426
- LangChain: Human-in-the-loop 文档 — https://docs.langchain.com/oss/python/langchain/human-in-the-loop ；interrupt 博客 — https://www.langchain.com/blog/making-it-easier-to-build-human-in-the-loop-agents-with-interrupt
- LangChain: Long-term memory / Store — https://docs.langchain.com/oss/python/langchain/long-term-memory ；LangMem 用户 profile — https://langchain-ai.github.io/langmem/guides/manage_user_profile/

**记忆与学习者建模**
- Mem0 论文（arXiv 2504.19413） — https://arxiv.org/abs/2504.19413 ；官网 — https://mem0.ai/
- Personalized Curriculum Design Using LLM-Powered Analytics — https://arxiv.org/html/2507.18949
- Awesome AI LLM4Education — https://github.com/GeminiLight/awesome-ai-llm4education

**评估、幻觉与成本**
- Pydantic: LLM-as-a-Judge Practical Guide — https://pydantic.dev/articles/llm-as-a-judge
- Evidently: LLM-as-a-Judge Complete Guide — https://www.evidentlyai.com/llm-guide/llm-as-a-judge
- MonteCarlo: LLM-As-Judge 7 Best Practices — https://montecarlo.ai/blog-llm-as-judge/
- Agent-as-a-Judge（arXiv 2508.02994） — https://arxiv.org/html/2508.02994v1
- Red Gate: Stop AI Hallucinations in Enterprise RAG — https://www.red-gate.com/simple-talk/ai/how-to-stop-ai-hallucinations-in-enterprise-rag-systems-a-complete-guide/
- K2View: RAG Hallucination — https://www.k2view.com/blog/rag-hallucination/
- DeepSeek 硬盘缓存降价公告 — https://api-docs.deepseek.com/zh-cn/news/news0802/ ；官方价格页 — https://api-docs.deepseek.com/quick_start/pricing ；V3.2 定价（财联社） — https://www.cls.cn/detail/2159813 ；V4 峰谷定价争议（雷峰网） — https://m.leiphone.com/category/yanxishe/NfnH0gxun9dwHGGX.html ；2026-04 缓存降价（新浪财经） — https://finance.sina.com.cn/tech/discovery/2026-04-27/doc-inhvvzha8347114.shtml
- Claude Code 缓存命中率 92%/成本降 81%（51CTO 引 Anthropic 生产数据） — https://www.51cto.com/article/841381.html ；Prompt Cache 实测省 84%（阿里云开发者社区） — https://developer.aliyun.com/article/1732421

**AI 评分/教育翻车案例**
- SSRN: Flawed Oversight — Teachers Don't Catch AI's Grading Mistakes — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5294732
- Ofqual 博客：AI 评分的技术能力、公平与透明 — https://ofqual.blog.gov.uk/2026/01/14/using-ai-in-marking-why-technical-capability-fairness-and-transparency-all-matter/
- ScienceDirect: ChatGPT 评分的可靠性与 grade inflation 风险 — https://www.sciencedirect.com/science/article/pii/S2590291126003530
- 英国最大 AI 批改试验（7 万份，83% 一致率）汇总 — https://howay.ai/ai-marking ；批改 4 小时→20 分钟案例 — https://substack.nomoremarking.com/p/an-ai-marking-case-study-from-four
- BBC: 英国政府允许教师用 AI 批改的指导意见 — https://www.bbc.com/news/articles/c1kvyj7dkp0o
- AI-powered Code Review with LLMs（arXiv 2404.18496） — https://arxiv.org/abs/2404.18496

**模型价格**
- 智谱 API 定价 — https://docs.bigmodel.cn/cn/guide/start/pricing ；GLM-4.6 模型页 — https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6
- 阿里云百炼价格 — https://help.aliyun.com/zh/model-studio/model-pricing ；Qwen 结构化输出 — https://www.alibabacloud.com/help/zh/model-studio/qwen-structured-output ；Qwen Function Calling — https://help.aliyun.com/zh/model-studio/qwen-function-calling
- DeepSeek 模型与价格 — https://api-docs.deepseek.com/quick_start/pricing ；OpenRouter deepseek-v3.2 — https://openrouter.ai/deepseek/deepseek-v3.2
- Kimi 开放平台 — https://platform.kimi.ai/ ；Kimi K2 定价分析 — https://apidog.com/blog/kimi-k2-api-pricing/ ；K2.5 — https://openrouter.ai/moonshotai/kimi-k2.5
- 火山方舟 Function Calling 文档 — https://docs.volcengine.com/docs/82379/1262342 ；豆包价格页 — https://www.volcengine.com/docs/82379/1099320
- 国内接入 Claude 六方案（SegmentFault） — https://segmentfault.com/a/1190000047871019 ；中转站行业调查（虎嗅） — https://www.huxiu.com/article/4878184.html
- 国产模型 API 价格对比（2026-04，腾讯新闻） — https://news.qq.com/rain/a/20260420A04GUB00

**隐藏式 AI 产品设计**
- Notion: The design thinking behind Notion AI — https://www.notion.com/blog/the-design-thinking-behind-notion-ai
- Fortune: Notion 设计负责人 Randy Hunt 谈 quiet approach — https://fortune.com/2026/06/12/it-isnt-our-goal-for-design-to-be-distinctive-says-notion-design-head-randy-hunt-on-prioritizing-quality-over-novelty-when-building-ai-apps/
- Ambient AI in UX Design: Building Invisible Interfaces — https://shuvo.dev/blogs/ambient-ai-in-ux-design-building-invisible-interfaces
- Optimizely: The Invisible AI Trap — https://www.optimizely.com/field-notes/articles/the-invisible-ai-trap
- Duolingo AI 课程生产（148 门课/12 个月） — https://www.linkedin.com/posts/grantslee_i-just-watched-duolingos-cto-reveal-how-activity-7333145883187838977-4-lJ
