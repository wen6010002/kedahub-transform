# 课搭 2.0 产品设计文档

结果型成长社区：方向科普 · 隐藏式 Agent 定制路线 · 闯关式推进 · 项目组陪跑

| 项 | 内容 |
|---|---|
| 版本 | v1.0（2026-09-13 初稿） |
| 状态 | 待用户评审 —— 带 ⚠️ 标记的为待拍板项 |
| 前置文档 | 《课搭产品方向：结果型成长社区》（用户手书，产品之魂） |
| 调研附件 | research/agent-tech.md · research/community-cohort.md · research/interaction-design.md · research/baseline-assets.md |
| 原型对照 | prototype/01~09 页面，本文档所有界面规格与原型一一对应 |

**读法**：第 1–2 章讲"为什么与凭什么"；第 3–5 章是产品体验的完整规格（每节对应一个原型页）；第 6–9 章是技术与数据；第 10–12 章是怎么落地。

---

## 目录

1. 产品定位与愿景
2. 商业模式与市场依据
3. 信息架构与用户旅程
4. 核心体验设计（页面级规格）
5. 闯关与激励系统
6. Agent 系统设计
7. 数据模型设计
8. API 设计
9. 技术选型与系统架构
10. 转型路线图（里程碑）
11. 冷启动运营手册
12. 风险登记册
13. 附录

---

# 1. 产品定位与愿景

## 1.1 一句话定位

课搭 2.0 = 面向大学生的**结果型成长社区**：从「我想成为谁」，到「我应该怎么走」，再到「我真的做到了」。

与 1.0 的本质区别：1.0 的核心资产是**资料**（存量知识），2.0 的核心资产是**路径与结果**（增量人生）。资料降为基础设施，路线成为产品核心，验收推动执行，学长提供陪伴，结果反哺社区。

产品公式：**资料是基础，路线是核心，验收推动执行，学长提供陪伴，结果形成社区。**

## 1.2 三条产品公理（一切设计的裁判）

来自用户手书方向文档，全文任何功能设计与之冲突时，以公理为准：

**公理一：免费也给真价值。** 不注册能读完所有方向科普；注册不付费能获得完整专属路线（全 8 阶段可见）、免费走完前两个阶段（含资料、任务、打卡）。免费层的目标不是"试用页面"，是"真的完成一个阶段"。14 天体验期的语义是"帮你走完第一阶段"，不是功能限时。

**公理二：模板保证专业性，Agent 负责个性化。** 路线不是凭空生成——每条方向先有人工整理、学长验证、版本化管理的**路线模板**（每阶段：学什么/为什么学/推荐资源/实践任务/阶段目标/验收标准）；Agent 只在模板上做参数化调整（压缩/展开/换侧重/换项目选题）。AI 对用户是隐藏的：用户只看到「正在根据你的情况制定专属路线」，任何界面不出现"AI 助手"式门面。

**公理三：收费收的是结果服务，不是知识封锁。** 付费内容 = 阶段验收 + 学长社群 + 深度陪跑。话术基调：「免费帮助你找到方向并开始走，付费帮助你更高质量地完成目标」。任何"不给钱就不给知识"的功能设计直接否决。

## 1.3 目标用户与核心场景

### 主 persona：路口期大学生（18–22 岁）

- 大二（核心，与作者同龄同校，共情最深）：面临"该选哪条路"的分岔，下学期就要决定实习方向
- 大一（早期）：迷茫型，需要 G-08「迷茫期→有方向」这样的入口路线
- 大三（中期）：抢救型，时间紧，需要重排优先级的激进路线
- 共同画像：资料囤积癖（网盘 500GB 课程，进度 0%）、收藏 ≠ 学习、间歇性踌躇满志持续性躺平；不缺信息源，缺「下一步做什么」的确定感

核心焦虑原文（用户手书）：**「我不知道自己该往哪里走，也不知道下一步该做什么。」**

### 次 persona：走通了的学长学姐（供给侧）

- 刚拿 offer 的大四 / 研三（招募黄金期：求职记忆最新鲜、毕设间隙有时间）
- 动机三层：兼职收入（验收按单计酬）、简历背书（认证学长徽章 + 服务时长证明）、身份认同（被学弟学妹需要的成就感）
- 供给闭环：优秀学员 → 骨干学员（免组费）→ 助教 → 主理学长（详见 §11.4）

### 四条核心用户旅程（jτ 检验过原型）

**旅程 A · 访客 → 定制（获客主线）**：刷到方向全景图资料 → 进首页看到方向导航 → 读 K-02 方向指南 20 分钟（免费、不注册）→ 被「适合谁/误区/时间账」说服 → 3 分钟问卷 → 生成仪式 → 展开专属路线 → 开始走第一阶段。断点风险：指南太长没人读完（对策：TOC 锚点 + 增益式段落）、问卷第 5 题流失（对策：滑杆+即时推算）。

**旅程 B · 免费学员 → 阶段二完成 → 付费（转化主线）**：走完阶段一（Python 补差）→ 尝到「知道下一步」的甜头 → 阶段二完成提交作品 → 免费层给一次真实验收体验（AI 初评 + 1 次互评）⚠️待拍板 → 阶段三入口出现验收通道门槛 → 对比页算账（单次 59 vs 项目组 449 含 N 次）→ 入组。转化设计核心：**让付费发生在"已经受益"之后，而不是"想学之前"**。

**旅程 C · 项目组学员的日常（留存主线）**：早 8:00 推送今日节点 → 打卡 → 遇到卡点在阶段小队频道提问（4h 首响）→ 周四答辩节看同学展示 → 月末自己上台 → 印章落章 → 解锁下一阶段。留存机制 = 同伴可见进度 + 仪式节点 + 印章收藏。

**旅程 D · 学长的一天（供给侧）**：打开验收台 → 今天 3 单终审（AI 初评已 pre-fill 评语草稿，改 2 处放行）→ 答辩节主持 → 看到分歧率周报（本周 AI 与自己判断一致率 91%）。供给侧体验决定付费层质量，验收台按"每单 ≤ 10 分钟"设计。

## 1.4 品牌延续

- **名称**：延续「课搭 KedaHub」，域名 kedahub.cn 不变。2.0 tagline：**「学长带路，陪你走到结果」**（1.0 是「学长整理，直接拿走」——从"拿资料"到"带上路"的心智升级）
- **视觉**：延续 1.0 品牌橙（--pri:#FF6B4A），2.0 将其深化为**朱砂色系**（#C2431D 印泥朱 / #E4571F 亮朱），气质从"校园活泼"升级为"温暖学术 × 精致编辑"；纸色底 + 墨色字 + 宋体大标题。详见 §4.5 交互语言与 prototype/assets/tokens.css
- **信任资产直接继承**：edu 邮箱认证体系、135 份资料、打卡引擎、成就引擎、AI 审核管线（见 research/baseline-assets.md，可复用率约 60–65%）

---

# 2. 商业模式与市场依据

> 本章结论全部来自 research/community-cohort.md（80+ 带来源引用），此处只留决策与数字，出处见调研原文。

## 2.1 为什么"结果型"成立

- 大学生知识付费客单价均值 105.7 元且三年缓涨——**为内容付费意愿低，为"结果与陪伴"付费意愿被验证**：求职陪跑话题 4.2 亿浏览、低档套餐 599 元起、生财有术 1,865 元/年续费率 60%+
- 训练营行业翻车（开课吧暴雷、保 offer 套路）把市场推向反面：**信任稀缺是机会窗口**——"平台背书的学长 + 过程 SLA + 不承诺就业"恰好站在共识位置
- roadmap.sh 验证了"免费路线图获客 + 服务/订阅变现"模式；牛客/字节青训营验证了"免费项目 + 求职生态变现"；课搭的差异锚点 = **定制路线 + 真人验收 + 同方向项目组**三合一，且自带 135 份资料与打卡数据的护城河

## 2.2 收入结构（五层）

| 层 | 产品 | 定价 | 说明 |
|---|---|---|---|
| 免费 | 方向科普 + 专属路线 + 前两阶段 + 打卡 | ¥0 | 获客与信任层 |
| 按次 | 单阶段验收包（四层验收 + 1 次免费复提） | ¥39–79/次（按阶段复杂度） | 入门转化品；天然的"按阶段解锁付费"，也是合规的轻分期 |
| 项目组（主力） | 方向项目组/期（3 个月） | **正式 ¥449 / 内测 ¥199** ⚠️ | 全部阶段验收 + 周会 + 答辩节 + 社群 + 案例库 |
| 陪跑 | 1v1 单次（简历/模拟面试/项目答疑） | ¥129–199/次 | 主理同时陪跑 ≤5 人 |
| 陪跑（高端） | 秋招陪跑套餐（3 个月） | ¥1,699–2,999 | 简历 3 轮 + 模拟面试 + 投递复盘；**不承诺 offer** |
| 订阅（长尾） | 案例库/精华库单独访问 | ¥99–199/年 | 打码预览构成免费层转化钩子 |

收入结构目标：项目组 60% / 按次 20% / 陪跑 15% / 订阅 5%。

## 2.3 价值拆解话术（为什么 449 不贵）

单次验收 59 元 × 8 阶段 = 472 元（只有验收）；项目组 449 元 = 8 阶段验收 + 周会 12 场 + 答辩节 3 场 + 案例库 + 社群。对知识付费均价 105.7 元是 4 倍，但含真人服务；对求职陪跑低档 599 元是 74 折，且交付清单明确。

## 2.4 合规红线（写进产品与话术的硬约束）

1. **不承诺就业结果**：全线只承诺过程 SLA（AI 初评即时、互评 24h、助教终审 48h、提问首响 4h）——开课吧/BloomTech（CFPB 罚 420 万美元）前车之鉴
2. **不碰培训贷**：不接任何第三方分期渠道；"按阶段解锁付费"是产品结构自带的合规先学后付
3. **退款友好且主动披露**：入组 7 天内未参与验收全退；单阶段验收未通过且不愿复提的可退该阶段；上海高院已判"概不退费"格式条款无效，主动友好退款在校园口碑社区是卖点而非成本
4. **资质定位**：定位"大学生社群服务 + 内容服务"（知识星球式）而非"办学"；扩张前咨询属地要求
5. **公益对冲**：每期 2–3 个免费名额给经济困难学生（品牌 + 舆论保险）

---

# 3. 信息架构与用户旅程

## 3.1 站点地图（2.0 全量路由）

```text
/（首页：方向导航 + 资料馆入口 + 抵达故事）          公开
/directions（方向总览，两大族聚合）                   公开
/directions/[code]（方向指南/科普页，如 k02）          公开 ← 内容 SEO 主战场
/directions/[code]/template（模板路线公开预览）        公开
/survey/[code]（情况问卷）                            登录
/generating（路线生成仪式）                           登录
/my/route（我的路线 · 闯关地图，产品灵魂页）           登录
/my/route/[nodeId]（节点详情：学/练/资源/出口标准）     登录
/my/record（成长记录：打卡/印章/热力图）               登录
/submit/[stageId]（阶段验收提交）                     登录+权限
/review/[submissionId]（验收结果与反馈）               登录
/library（资料馆，1.0 降位承接）                      公开
/library/[id]（资料详情，1.0 沿用）                   公开
/cohorts（项目组总览：本期/预约中/往期）              公开
/cohorts/[id]（项目组主页：星图/动态/验收队列/项目墙） 组内可见（预览打码）
/cohorts/[id]/defense（答辩节房间）                   组内
/cohorts/[id]/qa（组内答疑 + 助手检索卡）             组内
/pricing（定价）                                      公开
/stories（抵达故事）                                  公开
/me、/me/settings、/admin/*（1.0 沿用扩展）           按角色
/creator/*（资料上传，1.0 沿用）                      登录
```

移动端底部 tabbar（1.0 已有，改导航项）：首页 / 我的路线 / 项目组 / 资料馆 / 我的。

## 3.2 权限矩阵

| 能力 | 访客 | 注册学员 | 项目组成员 | 助教/主理 | ADMIN |
|---|---|---|---|---|---|
| 方向科普/模板预览/资料馆 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 生成专属路线 | — | ✓（每月 ≤2 次） | ✓ | ✓ | ✓ |
| 推进阶段 | — | 前两阶段 | 全部 | 全部 | — |
| 打卡/成长记录 | — | ✓ | ✓ | ✓ | — |
| 阶段验收 | — | 单次购买或免费体验 1 次 ⚠️ | 含在组费 | — | — |
| 项目组内容 | 打码预览 | 打码预览 | ✓ | ✓ | ✓ |
| 验收终审 | — | — | — | ✓ | 兜底 |
| 模板库管理 | — | — | — | 提议 | ✓ |

## 3.3 导航信息层级

首页首屏的三件事（按视觉权重排序）：① 方向导航（hero 路线票据 + 方向卡片）② 免费宣言（"方向指南全免费读"）③ 资料馆降位入口。资料分享保留但明确是"基础层"，永远排在方向之后——这本身就是转型的心智宣言。

---

# 4. 核心体验设计（页面级规格）

> 每节开头给出对应原型文件；规格写到"开发可直接照做"的程度；文案原则：克制的中文、不用感叹号、不制造焦虑、把承诺写具体。

## 4.1 首页 /（原型 prototype/01-home.html）

**结构（自上而下）**：

1. **顶栏**：wordmark（朱砂方印「课搭」）+ 导航（成长方向/资料馆/我的路线/抵达故事/项目组）+ 主 CTA「找到我的方向」
2. **Hero 双栏**：左 = 大宋体标题「从『我想成为谁』，到『我真的做到了』。」+ 副文案 + 双 CTA（主：开始定制我的路线；副：先逛逛方向指南）+ 四格数据（9 条方向/135 份资料/8 阶段均值/100% 免费读）；右 = **路线票据**（产品灵魂的可携带预览，见下）
3. **发车信息条**：mono 字体横向滚动的方向列表（K-01 Java 后端实习 · 12 周 · 可上车），营造"线路与班次"的隐喻而不喧宾夺主
4. **方向导航区**（01/DIRECTIONS）：双族 tab（实习就业 CAREER / 大学成长 CAMPUS）+ 3 列方向卡（route code + from→to + 一句话价值 + 周期/门槛/走过人数 + hover 时路线划线延伸）。卡片区底部固定说明行：「全部方向指南免费阅读，不含任何付费墙」
5. **宣言带**（夜墨底）：「大学生缺的从来不是资料，是『知道自己下一步该做什么』。」+ 三公理的展开（i 免费也给真价值 / ii 专业模板+为你定制 / iii 验收推动执行）
6. **四步路径**（02/HOW IT WORKS）：选方向 → 说清情况 → 拿到专属路线 → 走到结果，横向虚线路串联四站点（路线视觉语言的第一次教学）
7. **资料馆区**（03/LIBRARY，降位）：最新上架 5 行 + 编辑推荐侧栏 + 入口按钮。文案明示新关系：「它们现在嵌入每条路线的节点里——资料为路线服务」
8. **抵达故事**（04/ARRIVALS）：三张引述卡，右上角朱砂「已抵达」斜印——印章体系第一次露出
9. **终章 CTA**：大印章「路」+「你的下一条路线，从今天开始。」

**路线票据（Hero 视觉锚点）规格**：FROM Java 后端 → TO AI Agent 开发的车票头 + 5 站进度（已通过×2 云杉绿、进行中×1 亮朱脉冲、未解锁×1 灰、终点站菱形）+ 底部三格（进度 34% / 连续打卡 23 天 / 下一站 RAG 验收）。票据微倾斜 1.1°，hover 回正——"被握在手里的纸"的质感。它是整条产品线的视觉母题：问卷进度条、生成仪式装配线、闯关地图、星图，全部是它的变奏。

**首页不做的事**：不放资料流瀑布（那是 /library 的事）；不弹登录框；不用轮播。

## 4.2 方向指南页 /directions/[code]（原型 prototype/02-direction.html）

**定位**：转型后的 SEO 与信任主战场。每篇 3000–5000 字，认真到"值得被收藏"的程度。不注册全量可读。

**内容模板（11 节固定结构，写作 SOP 见 §11.2）**：§1 这个方向是什么（含一句话定位 callout）→ §2 为什么值得走（4 条论据，含真实 JD/薪资）→ §3 适合什么样的你（✓/✕ 双卡对照）→ §4 你的现状够不够（能力迁移对照表 + 差距等级条）→ §5 要补哪些知识（依赖顺序列表）→ §6 路线模板长什么样（8 阶段骨架卡 + 免费定制 CTA）→ §7 技术栈全景（chips，★=面试高频）→ §8 岗位与要求（岗位/要求/薪资表）→ §9 一笔时间账（三种投入强度的周期对照）→ §10 常见误区（误解→实际 的五组对照）→ §11 最终能去做什么（岔路图 + 保值 callout）

**交互**：左侧 sticky 目录 + 滚动高亮； misconception 用左灰右绿的双栏对照；模板卡内嵌「用这个模板定制我的路线 →」直通问卷。页底双 CTA：免费走起来（纸色卡）vs 想走得更快（夜墨卡，项目组）。

**数据来源纪律**：薪资用"2026 年公开 JD 与社区薪资帖中位区间，仅供体感"的免责格式；走过人数等社交证明上线初期用真实小数字（"37 人已抵达"比"10000+ 用户"可信）。

## 4.3 情况问卷 /survey/[code]（原型 prototype/03-survey.html）

**设计原则**：单题分屏（一次只答一题）、每题都有「为什么问这个」的 why 行（信任即转化）、键盘 1–9 快捷选择、退格回上一题、路线式进度条（顶部 7 个站点节点随答题点亮——票据语言的前奏）。

**七题固定框架（按方向动态生成题干与选项）**：

| # | 题域 | 控件 | 进路线的作用 |
|---|---|---|---|
| 1 | 年级 | 单选 4 卡 | 决定节奏松紧与投递窗口倒排 |
| 2 | 方向主基础（如 Java） | 单选 4 档（带"路线会怎么调"的暗示文案） | 压缩/展开前段阶段 |
| 3 | 迁移语言基础（如 Python） | 单选 3 档 | 补差阶段厚度 |
| 4 | 目标领域基础（如 AI/LLM） | 单选 3 档 | LLM 阶段切入点/能力测评 |
| 5 | 每日可投入时间 | 滑杆 0.5–5h，实时推算总周期文案 | **整条路线最重要的参数**，节点密度 |
| 6 | 目标抵达时间 | 单选 5 卡 | 取舍策略（冲窗口 vs 打底子） |
| 7 | 看重什么 | 多选 4 项 | 项目选题与包装侧重 |

滑杆的实时反馈文案示例（诚实且防冲动）：4h+ 时提示「全力模式，约 11 周抵达——建议只在假期选择」。文案纪律：宁可劝退不可诱导——「宁可诚实报 1 小时，不要冲动报 4 小时」直接写在页面上。

**提交后**：直接进入生成仪式（无中间确认页——降低流失）。

## 4.4 路线生成仪式 /generating（原型 prototype/04-generating.html）

**定位**：隐藏 Agent 的唯一前台。这 8 秒是产品的"开箱时刻"，做得好用户会截图。

**规格**：

- 夜墨全屏 + 背景巨字「路」；标题「正在根据你的情况，制定专属路线……」
- **工序日志逐条浮现（7 条，每条 0.7–1.2s）**：把后台决策翻译成人话，让个性化被看见——「你的 Java 已有课设项目——FastAPI 阶段压缩 1 周」「根据『简历好看+做出真东西』的偏好，选定首个实践项目：深大校园问答机器人」。**关键纪律：这些文案由规则模板渲染 patch reason，不是 LLM 现编**（归因可解释，见 §6.1）
- **装配动画**：8 阶段节点在水平线上依序点亮，节点下方显示阶段名与"为你调整后"的周数
- **落章仪式**：工序完成 → 印章以 3 倍缩放砸落（slam 动画 + 纸面微震）「路线已定」→ CTA「展开我的路线 →」
- 右下角提供「跳过 →」（等 2.4s 后才出现，尊重急性子）；全程 ≤ 9 秒，性能预算：动画纯 CSS/JS，无网络依赖
- **降级态**（Agent 失败时）：日志显示「正在核对路线模板……」后直接展示纯模板路线 + 文案「已为你加载标准路线，学长会尽快为你人工调整」——用户永远拿到一条路

---

*（§4.5 我的路线 · 闯关地图、§4.6 节点详情、§4.7 阶段验收 的完整规格见下篇 DESIGN-PART2，含交互语言定稿）*

---

# 5. 闯关与激励系统

*（与 §4.5 同篇，见 DESIGN-PART2）*

---

# 6. Agent 系统设计

> 本章是 2.0 的技术灵魂，结论来自 research/agent-tech.md（60+ 带来源引用）。总原则先行，四类能力逐个展开。

## 6.0 六条总原则（全系统裁判）

1. **AI 永不直接面向用户输出**：没有 chatbot 门面。用户看到的是进度条、工序日志、路线页、验收反馈卡。失败静默降级为模板 + 人工学长跟进（ambient AI 模式）
2. **LLM 输出操作指令（patch），不输出内容本身**：路线的全部资源/任务/验收标准来自人工验证的模板库（带唯一 ID）；资源引用在 schema 中用 enum 白名单——模型物理上无法引用库外资源，从机制上消灭"编造资源"类幻觉
3. **规则引擎先行，LLM 只做模糊判断**：确定性调整（时间少→拉长、目标近→压缩）用代码规则实现，零成本零幻觉；LLM 只处理"这个学生该不该跳过 RAG 入门"这类模糊决策
4. **AI 初评只做 pre-fill，分数生效权永远在人工**：教育评分翻车案例（教师发现不了 AI 评分错误、Ofqual 反对通用 AI 评分、grade inflation）指向同一架构结论——AI 是草稿，人是结论
5. **一切 AI 决策可解释、可编辑、可审计**：每条路线的生成参数与 patch 留档（learner 视角轻量归因，管理视角完整审计）；路线页本身是编辑器
6. **成本非瓶颈，学长时间才是**：单次路线生成 ¥0.013–0.05、300 活跃用户月成本 ≈¥200——所有架构选择围绕"放大学长时间"设计（AI 初评过滤、互评前置、分歧回流）

## 6.1 路线规划 Agent（核心）

**架构：模板库 + 规则引擎 + LLM patch 决策 + 校验链 + HITL**

```text
问卷提交
  ↓
[规则引擎]（确定性调整：时间/目标期/免费层边界）—— 零 LLM
  ↓
[LLM 决策]（Vercel AI SDK generateObject + Zod，1–2 次调用）
  输入：系统指令（调整规则）+ 模板 JSON（稳定前缀，prompt cache 命中 80%+）+ 问卷 + learner profile
  输出：RoutePatch（见下）
  ↓
[校验链] Zod safeParse → 错误回喂重试（≤2 次）→ 业务规则校验（时长总和匹配目标期、依赖无环、白名单）
  ↓ 失败
降级：纯模板 + 规则引擎结果，标记 NEEDS_REVIEW 转人工
  ↓ 成功
落库（user_route + patch 审计记录）→ 前台生成仪式消费工序日志
  ↓
[HITL] 新方向前 N 条强制学长抽检；稳定后抽检率 5–10%；学长修改样本回流 golden set
```

**RoutePatch schema（面向决策而非内容）**：

```ts
RoutePatchSchema = z.object({
  templateId: z.enum([/* 该方向可用模板，后端注入 */]),
  operations: z.array(z.discriminatedUnion('op', [
    z.object({ op: z.literal('skipStage'),    stageId: StageIdEnum, reason: z.string().max(120) }),
    z.object({ op: z.literal('compressStage'),stageId: StageIdEnum, ratio: z.number().min(0.5).max(0.9), reason: z.string().max(120) }),
    z.object({ op: z.literal('insertStage'),  beforeStageId: StageIdEnum, fromTemplateId: PrepTemplateEnum, reason: z.string().max(120) }),
    z.object({ op: z.literal('insertModule'), intoStageId: StageIdEnum, moduleIds: z.array(ModuleIdEnum), reason: z.string().max(120) }),
    z.object({ op: z.literal('swapProject'),  projectId: ProjectIdEnum, reason: z.string().max(120) }),   // 按偏好换选题
  ])).max(6),   // patch 上限：防过度调整破坏教学逻辑
})
```

所有 Enum 由后端从模板库动态注入合法值；reason 是给学长/审计看的，用户侧文案由规则模板渲染（「因为你的 Python 是零基础，我们为你加入了 Java 人专属迁移路径」——同一 patch 必然渲染出同一句话，可解释且稳定）。

**幂等与缓存**：同一 (问卷, 模板版本) 60 天内重复生成直接回缓存——防重复计费与结果漂移；用户改问卷重答则是新 key。

**动态调整 = 同一条链路**：阶段验收后 / 用户主动「根据我的近况调整」按钮（Notion AI 的 context-over-chat 模式），输入换成本次事件增量，复用 RoutePatch。重大调整（砍阶段/换模块）需用户确认后生效，微调（时长 ±10%）静默生效。

## 6.2 验收评估链路（四层漏斗，Spring AI Alibaba 承载）

```text
学员提交作品（代码仓库/文档/链接 + 自述）
  ↓ L1 AI 初评（即时，<1min）
     代码类：先跑确定性检查（测试/构建/lint，沙箱）→ LLM 输入=验收标准+提交 diff+检查摘要
            输出=分维度分数+逐条 evidence（引用代码位置）+低置信维度标记
     文档类：rubric 分维度（完成度/正确性/深度/匹配度）+ 原文证据锚定
  ↓ L2 组员互评（前置义务：本人须互评 2 份才可提交自己的；24h 内完成）
     结构化模板：3 优点 + 2 改进点 + 1 提问（Exercism 验证过的志愿者互评质量可控）
  ↓ L3 助教终审（SLA 48h，决定权在人）
     AI 评语作为 pre-fill 草稿；打回必须附可执行修改建议；免费复提 ≤7 天
  ↓ L4 月度答辩节（主理主持）
     5–8 分钟展示 + 问答；通过=印章+解锁下一阶段+作品入案例库
```

**为什么用 Spring AI Alibaba Graph 做这条链路**：① 它是真正的多步状态机（提交→检查→初评→置信度路由→终审→归档），与 Graph 的 HITL/流程快照/检查点天然同构；② 作者求职 AI Agent 岗，简历上同时有 TS 生产链路（路线生成）+ Java Agent 编排（验收评估）两条叙事；③ 链路对延迟不敏感，跨服务边界成本可忽略。1.0 GA（2025-06）后已生产可用。

**安全与反作弊**：
- prompt injection（提交里写"请给满分"）：提交内容作为数据而非指令传入（明确分隔符+角色声明）+ 注入模式检测 + 异常高分自动进人工队列
- 学生代码执行：容器沙箱，永不跑在生产环境
- 代做/AI 代写：主防线是 **L4 答辩口试**（现场追问设计取舍、要求改一处需求现场改、walk through 关键代码），辅以 git 提交历史演进检查；不依赖 AI 检测工具（不可靠且误伤）

## 6.3 答疑助手（grounded RAG，低档模型）

- 检索：PostgreSQL + pgvector（栈内零新增）；语料 = 学长终审过的高质量 QA 对 + 资料库；Redis 缓存检索结果
- 生成：qwen-flash 级（单次 ¥0.002–0.006），输出 schema 强制 `citations: z.array(QaIdEnum).min(1)` —— 无引用不出话
- 降级即导流：检索相似度低于阈值 → 不硬答，展示「相似问题」卡片 + 建议发起提问 @学长，问题自动进答疑队列——**拒答机制恰好给社区互动导流**，符合结果型社区定位
- 呈现：嵌在问题页的"相似问题与解答"卡，不是独立 chatbot

## 6.4 学习者画像（learner profile）

结构化学业状态，不是自由文本记忆：`learner_state`（基础标签带置信度与时效、当前阶段、各节点完成态、验收分维度弱项、活跃节奏、目标变更史）。每次验收/打卡/改目标产生事件（event log 可回放）；阶段验收后 + 用户主动触发时由「规则汇总 + LLM 重估」刷新。防漂移：重估基于全量事件而非最近一次；防抖动：重大调整需确认。

## 6.5 评测与质量（evals）

- **golden set 先行**：20–50 组「问卷画像 → 期望调整 checklist」标注集（零基础冲实习/有基础保研/目标偏产品…），每次改 prompt/schema 跑回归
- **rubric 写成功也写失败样例**，不留给 judge 即兴空间
- **LLM-as-judge 先对人工校准**（20+ 样本一致率达标才允许规模化）
- **线上核心监控指标：AI 初评与助教终审的分歧率**（按任务类型分桶）；分歧样本自动回流 golden set——人工终审在架构上的第二重价值：数据飞轮

## 6.6 模型分层与成本（2026 中国可商用）

| 层 | 场景 | 模型 | 单次成本 |
|---|---|---|---|
| L1 低档 | 答疑、意图分类、置信度预筛 | qwen-flash / deepseek-flash | <¥0.01 |
| L2 中档主力 | 路线 patch、验收初评 | GLM-4.6 或 qwen3-plus（百炼 JSON Schema 严格模式） | ¥0.013–0.05 |
| L3 高档（内部） | 低置信重评、离线 golden set 质检 | Claude Sonnet 5（合规通道）或 qwen3-max | 仅长尾 |

成本情景：300 活跃用户/月 ≈ **¥200 以内**（叠加 prompt cache 与 L1 分流可压到 ¥100–150）。国产模型价格变动频繁，落地前以官方价格页复核（见 agent-tech.md §5）。

---

# 7. 数据模型设计

> 复用 vs 新建的完整判决见 research/baseline-assets.md。本章只列 2.0 新建与关键改造（Prisma 风格）。

## 7.1 新建表（8 张核心 + 3 张辅助）

```prisma
// ① 方向（growth direction）—— 全站导航的骨架
model Direction {
  id          String   @id @default(cuid())     // 也可用 code 如 "k02"
  code        String   @unique                   // K-01 / G-03
  family      DirectionFamily                    // CAREER 实习就业 / CAMPUS 大学成长
  title       String                             // "Java 后端 → AI Agent 开发"
  fromState   String   @map("from_state")        // 起点（零基础/Java 后端…）
  toState     String   @map("to_state")          // 终点（AI Agent 开发…）
  pitch       String                             // 一句话价值
  guide       Json                               // 11 节科普正文（结构化，见 §11.2）
  stats       Json                               // 周期/门槛/热度（缓存计数）
  status      DirectionStatus                    // DRAFT/PUBLISHED/ARCHIVED
  sortOrder   Int      @default(0)
  roadmapTemplates RoadmapTemplate[]
  cohorts     Cohort[]
}

// ② 路线模板（人工验证、版本化）—— 1.0 的 Roadmap 表降级演化而来
model RoadmapTemplate {
  id        String   @id @default(cuid())
  directionId String
  version   Int      @default(1)                // 生成时锁定版本，可追溯可复现
  content   Json                               // 富 schema：见 7.2
  status    TemplateStatus                      // DRAFT/REVIEWING/PUBLISHED/RETIRED
  validatedBy String[]                          // 验证学长 user id
  changelog Json                               // 版本变更记录
}

// ③ 用户路线实例（每用户一条活跃，可多版本）—— Agent 生成的落点
model UserRoute {
  id           String   @id @default(cuid())
  userId       String
  directionId  String
  templateId   String
  templateVersion Int
  questionnaire Json                             // 问卷快照（幂等 key 的一部分）
  patch        Json                               // RoutePatch 审计
  content      Json                               // 应用 patch 后的完整路线（富 schema）
  status       RouteStatus                        // GENERATING/ACTIVE/PAUSED/GRADUATED/ARCHIVED
  version      Int      @default(1)              // 调整产生新版本
  activatedAt  DateTime?
  auditTrail   Json                               // 每次调整的输入/输出/操作人
  @@unique([userId, status])  // 一条 ACTIVE（用部分唯一索引）
}

// ④ 节点进度账本（闯关语义）—— RoadmapCheck 的进化版
model NodeProgress {
  id        String   @id @default(cuid())
  userId    String
  routeId   String                              // UserRoute id
  nodeId    String                              // 稳定 stepId：p{i}-s{j}
  phaseIdx  Int
  status    NodeStatus                          // LOCKED/AVAILABLE/IN_PROGRESS/SUBMITTED/PASSED
  passedAt  DateTime?
  @@unique([userId, routeId, nodeId])
}

// ⑤ 阶段验收（四层漏斗的状态机）
model Submission {
  id        String   @id @default(cuid())
  userId    String
  routeId   String
  stageId   String
  round     Int      @default(1)               // 免费复提轮次
  payload   Json                               // 仓库链接/文档/附件引用 + 自述
  status    SubmissionStatus                    // DRAFT/AI_REVIEWING/PEER_REVIEW/FINAL_REVIEW/NEEDS_FIX/PASSED/DEFERRED
  aiReview  Json?                               // L1 输出：分维度分+evidence+置信度
  finalReview Json?                             // L3：助教评语/结果
  defenseAt DateTime?                           // L4 排期
  createdAt DateTime @default(now())
}

// ⑥ 互评（L2）
model PeerReview {
  id           String @id @default(cuid())
  submissionId String
  reviewerId   String
  content      Json                              // 3优点+2改进+1提问 结构化
  @@unique([submissionId, reviewerId])
}

// ⑦ 项目组
model Cohort {
  id          String @id @default(cuid())
  directionId String
  name        String                             // "AI Agent 开发 · 2026-10 组"
  periodStart DateTime  periodEnd DateTime
  capacity    Int    @default(30)
  status      CohortStatus                       // RECRUITING/ACTIVE/GRADUATED
  leadId      String                             // 主理学长
  assistantIds String[]                          // 助教
}

model CohortMember {
  cohortId String  userId String
  role     MemberRole                             // MEMBER/CORE(骨干)/ASSISTANT/LEAD
  joinedAt DateTime @default(now())
  stageSnapshoot Int                             // 入组时阶段（星图初始位置）
  @@id([cohortId, userId])
}

// ⑧ 学习者画像 + 事件
model LearnerState {
  userId  String @id
  profile Json                                   // 结构化学业状态（带置信度与时效）
  updatedAt DateTime @updatedAt
}
model LearnerEvent {
  id        String @id @default(cuid())
  userId    String
  type      String                               // CHECKIN/PASSED/FAILED/GOAL_CHANGE/…
  payload   Json
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
}

// 辅助：组内问答对（RAG 语料，学长终审后入库）、案例库（通过验收的作品集）
model QaPair { id String @id @default(cuid()) cohortId String? directionId String question String answer String status QaStatus reviewerId String? embedding Unsupported? /* pgvector via raw */ createdAt DateTime }
model ShowcaseItem { id String @id @default(cuid()) submissionId String @unique cohortId String title String summary Json authorId String defenseAt DateTime }
```

## 7.2 模板富 schema（content Json 的形状）

1.0 的 `{phases:[{steps:[{id,text,note}]}]}` 升级为：

```ts
type Template = {
  phases: Array<{
    id: string                     // p1..p8 稳定
    title: string                  // Python 补差与工程环境
    why: string                    // 为什么学（科普正文，节点详情页用）
    weeks: [number, number]        // 弹性区间 [1,2]
    exitCriteria: string[]         // 出口标准（验收 checklist 来源）
    nodes: Array<{
      id: string                   // p1-s1
      title: string                // 学什么
      kind: LEARN | PRACTICE | READ | MILESTONE
      resources: string[]          // 资源 ID（库内白名单）→ 渲染资料卡
      task?: string                // 实践任务
      estMinutes: number           // 预计时长（按节点密度排布）
    }>
    acceptance: {                  // 阶段验收
      type: CODE | DOC | DEFENSE
      rubric: Array<{ dimension: string; weight: number; anchors: {good: string; bad: string} }>
      projectOptions?: string[]    // 可换选题（Agent swapProject 的白名单）
    }
  }>
}
```

**硬约束**：nodeId 发布后不可变（进度账本引用）；模板改版必须新 version，老 UserRoute 不动；pgvector 的 QaPair.embedding 用 raw SQL 迁移维护（1.0 的 trgm GIN 有同款先例与坑）。

## 7.3 1.0 表处置速查

直接复用：User/StudentProfile（edu 认证）/DailyCheckin（打卡账本）/Achievement 引擎/UserAchievement/Notification/Follow·Like·Favorite·Dynamic/Report·AuditLog/Announcement。
改造：Roadmap→RoadmapTemplate（数据迁移脚本：现有 9 条公共路线升格为各方向模板 v1）；Comment（扩 targetType: cohort/qa）；AchievementKey 枚举新增阶段通关系（需迁移）。
冻结：支付链路、收益/提现、宿舍楼字段、作品转移（VIP 收费上线时按需复活 Order 骨架）。

---

# 8. API 设计（关键端点）

遵循 1.0 契约（/api/v1 前缀、JWT cookie、{error:{code,message}}、assertSameOrigin strict）。新增：

```text
# 方向与科普
GET  /directions                          两族聚合（缓存 60s）
GET  /directions/:code                    指南全文 + stats
GET  /directions/:code/template           模板公开预览（脱敏：资源卡可见）

# 路线生成与推进
POST /routes/generate                     body: {directionCode, questionnaire} → 202 + jobId
GET  /routes/generate/:jobId/status       生成仪式轮询（steps[] 工序日志）
GET  /my/route                            当前 ACTIVE 路线（含进度/下一节点）
POST /my/route/:nodeId/progress           节点推进（CHECKIN 语义，限流）
POST /my/route/adjust                     「根据近况调整」（重大项返回 pendingConfirm）
GET  /my/record                           打卡/热力图/印章（1.0 checkinStats 演进）

# 验收（四层）
POST /submissions                         提交 {stageId, payload}（前置：互评义务校验）
GET  /submissions/:id                     状态机 + 各层反馈
POST /submissions/:id/peer-review         互评提交
POST /admin/submissions/:id/final-review  助教终审（AI pre-fill 在 GET 里）
POST /cohorts/:id/defense/schedule        答辩排期（主理）

# 项目组
GET  /cohorts                             总览（RECRUITING 优先）
GET  /cohorts/:id                         组页（成员星图/动态/队列——组内 token）
POST /cohorts/:id/join                    入组（edu 认证 + 库存 + 支付）
GET  /cohorts/:id/starmap                 星图数据（各成员当前阶段，组内）
GET  /cohorts/:id/qa  POST /cohorts/:id/qa   答疑列表/提问（助手检索卡嵌在列表）
GET  /showcase  GET /showcase/:id         案例库（公开打码 / 组内完整）
```

限流沿用 1.0 模式：generate 2/月/用户、submission 3/天/阶段、peer-review 前置义务在提交时校验。

---

# 9. 技术选型与系统架构

## 9.1 决策总表

| 领域 | 选型 | 决策理由（对比与出处见 agent-tech.md §2/§5） |
|---|---|---|
| 主应用 | **沿用 Next.js 14 App Router + TS + Prisma/PostgreSQL + Redis + MinIO**（1.0 全栈，零迁移） | 可复用率 60–65%；单人可维护性第一 |
| Agent 主框架 | **Vercel AI SDK（generateObject/streamObject + Zod）** | 栈内零新增依赖；结构化输出最顺手；无 chat UI 依赖的 agent loop 原生支持——与隐藏式产品形态天然契合。Mastra 为次选（想要 workflow 原语时再评估） |
| 为什么不上 LangGraph | 任务本质是"约束生成"不是"多 Agent 编排"——prompt chaining + 一步自检足够 | Anthropic 模式阶梯定位；引入框架 = 为一次 LLM 调用付框架运维成本。未来链路复杂化（多轮人机协作）时的首选升级方向 |
| 验收评估服务 | **Spring AI Alibaba Graph（独立 Java 服务）** | 状态机/HITL/流程快照与四层漏斗同构；作者求职的第二条技术叙事（Java Agent 编排生产落地）；对延迟不敏感，跨语言边界成本可忽略 |
| 向量检索 | **PostgreSQL + pgvector** | 栈内零新增；问答规模 <10 万，无需独立向量库 |
| 模型分层 | L2 主力 GLM-4.6 / qwen3-plus；L1 qwen-flash；L3 Claude（仅内部质检） | 见 §6.6 成本表；百炼 JSON Schema 严格模式对结构化输出有额外加成 |
| 任务队列 | 沿用 BullMQ（campus-jobs 队列 + on-demand enqueue + 重试退避 + fail-closed） | 1.0 已生产验证（评论 AI 审核）；新增 case：route-generate、submission-review |
| 部署 | 沿用 docker compose（app×3 + worker + Caddy + PgBouncer）；新增 review-svc Java 容器 | 1.0 部署手册与压测数据直接继承 |

## 9.2 系统架构图（文本）

```text
                    ┌─ Caddy (TLS/反代) ─ kedahub.cn
浏览器 / 手机 ───────┤
                    ├─ app ×3 (Next.js)：页面 + /api/v1（含 Agent 调用的发起端）
                    │      ├─ Vercel AI SDK → GLM/qwen API（路线 patch、答疑）
                    │      └─ enqueue → Redis(BullMQ)
                    ├─ worker (Node)：route-generate / submission-L1 / 通知 / cron
                    │      └─ HTTP → review-svc
                    ├─ review-svc (Java · Spring AI Alibaba Graph)：验收四层状态机
                    │      └─ LLM API（初评）+ 沙箱执行器（代码检查）
                    ├─ PostgreSQL（业务表 + pgvector qa_pairs）─ PgBouncer
                    ├─ Redis（队列/缓存/限流/验证码）
                    └─ MinIO（作品附件/资料，沿用）
```

**边界纪律**：路线生成在 app/worker（TS 生态，模板 JSON 直读直写）；验收状态机在 review-svc（Java）；两者只通过 HTTP + 共享 DB 交互。DB schema 仍由 Prisma 单点管理（Java 侧只读它需要的表 + 写自己的 review 表，避免双 ORM 治理灾难）⚠️（review 表放 Prisma 还是 JPA 待 M2 拍板，倾向 Prisma 管理、Java 用 JdbcTemplate 读写）。

## 9.3 性能与成本预算

- 读路径复用 1.0 五层缓存 + trgm 的全部优化（415 RPS 基线）；方向指南页 SSG/ISR（revalidate 300s）
- AI 成本：300 活跃用户/月 ≤ ¥200（§6.6）；服务器沿用现有机型；review-svc 常驻内存 ≤ 512M
- 生成仪式的 job 轮询：SSE 推送（1.0 预览页已有 SSE 经验）优于轮询，失败自动降级轮询

## 9.4 前端交互技术（详见 DESIGN-PART2 §交互语言）

原型验证于纯 HTML/CSS/JS；生产实现于 React（1.0 技术栈内）：Framer Motion（章节过渡/印章落章）、SVG stroke-dashoffset（路线描线）、IntersectionObserver（滚动叙事）、CSS scroll-driven animation（阶段推进，渐进增强）、prefers-reduced-motion 全量降级。禁 UI 组件库（1.0 军规沿用）。

---

# 10. 转型路线图（里程碑）

> 总策略：**在 campus-market 代码库上渐进演进，不重写**。新建 kedahub-next 仓库先承载设计资产（本文档+原型+调研），代码转型开工时将其作为 campus-market 的 fork 起点或直接在原仓库开 v2 长分支 ⚠️（倾向：原仓库拉 transform/v2 分支，稳定后合入 main——保 CI/测试/部署链路连续性）。

**M0 · 设计定稿（本周）**：本文档评审 + 原型走查 + 交互语言定稿 → 全部设计资产入 kedahub-next 仓库。

**M1 · 骨架切换（2 周）**：Direction/模板/NodeProgress 三表迁移与种子；方向指南首发 3 篇（K-01/K-02/G-01）+ 模板 v1（K-02 为主）；新首页与方向页上线（旧资料流沉到 /library，1.0 全功能保留）；问卷 + 生成仪式（此阶段 Agent 后端可为"规则引擎 + 人工后台"，LLM 接 M2）。**验收：真实用户能从首页走到专属路线页。**

**M2 · Agent 上线（2–3 周）**：Vercel AI SDK 接入（GLM/qwen key）、RoutePatch 全链路、golden set v1（20 组）、HITL 抽检台（admin）、路线页闯关交互完整版（解锁/推进/打卡联动 DailyCheckin）、learner_event 落地。**验收：patch 幂等、降级路径演练通过、抽检分歧率有面板。**

**M3 · 验收闭环（3 周）**：Submission 四层状态机（先 TS 版跑通 L1+L3，L2 互评同期）+ 免费层一次体验验收 ⚠️ + 印章体系（Achievement 迁移）+ 成长记录页。**验收：一次真实提交走完 L1→L3 全链路。**

**M4 · 项目组 + 商业化（3 周）**：Cohort/Member/星图/答辩排期/QaPair+RAG 助手；支付通道决策 ⚠️（复活 1.0 epay 骨架 vs 微信/支付宝官方 vs 先线下收款）；定价内测 199 开第一期（K-02 方向 30 人）。**验收：第一期组开组。**

**M5 · review-svc（与 M4 并行）**：Spring AI Alibaba Graph 版验收状态机替换 TS 版 L1 编排 + 沙箱执行器；答辩录音归档。**验收：Java 服务接管 L1，双写对账一周。**

每里程碑沿用 1.0 的质量纪律：集成测试 + e2e + 冒烟脚本 + 迁移前 pg_dump 快照 + compose build migrate 的部署坑清单（见 baseline-assets 与项目记忆）。

---

# 11. 冷启动运营手册

## 11.1 首发矩阵

方向首发 3+2：K-01（Java 后端实习，受众最广）、K-02（后端→AI Agent，作者亲身路线，模板最真）、G-01（保研，深大需求最硬）+ G-08（迷茫期入口，承接心智）+ K-03（AI 应用开发，蹭 AI 岗热度）。每个方向 = 1 篇指南 + 1 份模板 v1 + 1 位主理候选。

## 11.2 内容生产 SOP

**方向指南（11 节固定结构）**：主笔 = 走过该路线的学长（作者写 K-02），编辑 = 作者本人；字数 3000–5000；每篇过"三问"评审：一个外行读完能不能决定走不走？薪资/数据有没有来源？误区有没有冒犯性（不制造焦虑）？发布节奏 1 篇/周（质量优先于数量——指南是品牌）。

**模板生产**：AI 辅助起草（Duolingo 用 AI 12 个月产出 148 门课的思路：AI 供给 + 人工验证）→ 学长逐节点校对（资源是否还活着/任务是否可完成/验收标准是否可判）→ 版本化入库 → 每学期复审一次（changelog 记录）。**验收标准必须"可判"**：能写出 good/bad 锚点的才配上模板。

## 11.3 免费层 → 付费层转化漏斗（指标看板）

```text
方向指南阅读（UV）→ 问卷开始 → 问卷完成（目标 ≥60%）→ 路线激活
→ 第一周打卡 ≥3 天 → 完成阶段一 → 完成阶段二（免费终点）
→ 体验验收 → 付费转化（行业基线：低价转正价 10–20%）
```

北极星：**「每周处于'知道下一步'状态的用户数」**（= 活跃且未卡点超 48h）。健康线：验收参与率 >60%、周会出勤 >40%、NPS >50、续组/老带新 >40%。

## 11.4 学长招募与激励

- 招募窗口：秋招 offer 季（11–12 月）与春招后（4–5 月）；首批锁定"刚拿完 offer 的大四/研三 + 技术社团骨干"
- 报酬：验收单 30–60 元/单 + 周会/答辩主讲 150–300 元/场 + 答疑津贴 500–1000 元/月；主理 2000–3000/期 + 组人数提成
- 非现金层（同等重要）：认证学长数字徽章 + 可展示主页 + 平台出具服务时长/验收单数证明（求职辅导市场 4.2 亿浏览但信任稀缺——认证恰好解决学长的求职信号）
- 冗余：每方向双主理候选 + 助教池 1.5 倍储备 + SLA 超时自动转派
- 自循环目标：每期毕业生 10–15% 转化为下期助教/骨干

## 11.5 仪式日历（组内）

月度节奏：每月 1 日新组进组（开组仪式：目标公开承诺 + 结对）→ 每周主题式周会（踩坑/工具/面经，骨干轮值主持）→ 每月最后一周四答辩节 → 结组 = 下一期招生路演（毕业作品就是广告）。

---

# 12. 风险登记册

| # | 风险 | 概率×影响 | 对策 | 章节 |
|---|---|---|---|---|
| 1 | 就业承诺合规（广告法/群体纠纷） | 低×致命 | 只承诺过程 SLA；案例用真实署名自述；话术培训 | §2.4 |
| 2 | 培训贷红线 | 低×致命 | 不接分期；按阶段付费结构天然化解；客服话术明令 | §2.4 |
| 3 | 大额预收退款纠纷 | 中×高 | 小额按阶段；友好退款主动披露；对公留痕 | §2.4 |
| 4 | 代做/AI 代写毁验收公信力 | 中×高 | L4 答辩口试为主防线 + git 历史检查；不依赖检测工具 | §6.2 |
| 5 | 学长断供（秋招/毕业） | 高×中 | 双主理 + 助教池冗余 + 升级通道留人 | §11.4 |
| 6 | 社区开组 3 周后冷却 | 中×高 | 答辩节 + 案例库更新 + 骨干轮值 + 提问响应义务化 | §11.5 |
| 7 | 路线生成质量翻车（幻觉/荒谬 patch） | 低×中 | enum 白名单 + patch≤6 + golden set + 抽检 + 降级纯模板 | §6.1 |
| 8 | AI 初评被 prompt injection 操纵 | 中×中 | 数据分隔 + 注入检测 + 异常高分进人工 | §6.2 |
| 9 | 免费层被白嫖党拖垮成本 | 低×低 | AI 成本 ¥0.7/人/月，白嫖无利可图；服务器为边际成本 | §6.6 |
| 10 | 校内舆论（学生项目收费） | 中×中 | 定位透明 + 免费层永久保留 + 每期公益名额 | §2.4 |
| 11 | 牛客/青训营免费同质竞争 | 中×中 | 差异=定制路线+真人验收+小组三合一；自有完成率对比数据是抄不走的内容资产 | §2.1 |
| 12 | 单人开发带宽（作者求职中） | 高×高 | M1–M5 每步可独立上线产生价值；模板/指南可并行外包给学长主笔 | §10 |

---

# 13. 附录

## 13.1 文档索引

- 用户手书：~/Downloads/课搭产品方向：结果型成长社区.md（产品之魂，本文档的一切起点）
- 调研：research/agent-tech.md（Agent 技术与模型成本）· research/community-cohort.md（同期制/训练营/定价/合规）· research/interaction-design.md（交互语言）· research/baseline-assets.md（1.0 资产盘点）
- 原型：prototype/index.html（封面导览）· 01 首页 · 02 方向指南 · 03 问卷 · 04 生成仪式 · 05 我的路线 · 06 节点详情 · 07 资料馆 · 08 项目组 · 09 定价
- 1.0 侧关键文档：docs/PLAN_V12.md（当前态）、PRODUCT.md、API_CONTRACT.md、DEPLOY.md

## 13.2 待用户拍板清单（⚠️ 汇总）

1. 免费层是否给一次真实验收体验（倾向：给，转化钩子最强）
2. 项目组定价 449 正式 / 199 内测（调研建议区间 399–499）
3. 转型代码分支策略：原仓库 transform/v2 分支（倾向）vs kedahub-next 全新开发
4. 支付通道：复活 epay 骨架 vs 官方支付 vs 先线下
5. 新仓库 kedahub-next 当前为 private——是否公开
6. 免费阶段边界最终定稿：前 2 个阶段 + 14 天内走完阶段一（倾向方案）

---

*本文档 PART2（§4.5 我的路线闯关地图 · §4.6 节点详情 · §4.7 验收 · §5 激励系统 · 交互语言定稿）见 DESIGN-PART2.md —— 待交互设计调研（research/interaction-design.md）返回后成稿。*
