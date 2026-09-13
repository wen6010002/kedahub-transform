# 课搭「结果型成长社区」交互设计调研报告

调研主题：从校园工具到结果型成长社区的交互语言设计
产品形态：大学生选定目标（如 Java 后端 → AI 应用开发、保研）→ 系统生成约 8 阶段的个人专属学习路线 → 推进 / 打卡 / 提交作品 / 过阶段验收 → 拿到结果（offer / 上岸）
设计基调（已定稿）：有闯关属性但**不是游戏化**；要仪式感、即时反馈、低认知负荷；气质「精致、克制、有分量」；目标用户 18-24 岁大学生，场景严肃。
调研日期：2026-09 · 调研方法：桌面研究（产品官方博客、设计机构案例、UX 社区拆解、W3C/浏览器官方文档）+ 交互设计专业分析

---

## 一、执行摘要：我们该采用什么交互语言

### 1.1 核心判断

多邻国的「舒服」不在皮肤而在三层结构：**替用户消灭选择、把复习织进前进、下一步永远只有一个**。这三层我们全部适用，且我们的场景（AI 生成个人路线）比多邻国更有资格做「唯一路径」——路线本身就是定制的，用户不需要再选。但多邻国外层的 XP、连胜火焰、卡通角色、联盟排行，是与我们气质冲突的部分，全部剥除。

「高级定制感」的参照系不在教育产品里，而在 Linear / Things 3 / Apple 这类产品里：**严格的排版纪律（单一字族、4px 栅格）、约 200ms 的动效基准、色彩只在状态处出现、信息密度高于装饰密度**。我们要做的是：用这套「工具级工艺」去承载一个「有重量的人生旅程隐喻」。

### 1.2 推荐的交互语言：三层体系（内部代号「山径 · 印记」）

| 层 | 职责 | 借用的隐喻 | 呈现纪律 |
|---|---|---|---|
| 语义层 | 让「推进」可感知 | 远征登山：山径、垭口（验收点）、云雾（未解锁）、登顶（拿结果） | 等高线 / 地形图式的克制图形，禁止卡通插画 |
| 物证层 | 让「完成」有分量 | 护照与印章：每过一阶段盖一枚「印记」，8 枚印记最终拼合为完整纹章 + 登顶证书 | 雕版印章美学（阴刻 / 阳刻、墨色、纸感），编号可验证 |
| 呈现层 | 让整体「高级」 | 书卷 / 章节排印：8 阶段 = 8 章，衬线标题 + 细体编号 + 大留白 | Linear 式纪律：单一主字族、统一动效时长、色彩仅用于状态 |

一句话定位：**把多邻国的路径骨架，穿上 Linear 的排版工艺，盖上有重量的印章。**

### 1.3 五条必须贯彻的设计原则

1. **每屏只有一个主行动**。打开路线页，当前阶段的「继续任务」是全屏唯一高亮按钮，自动定位滚动到当前节点——这是多邻国 2022 年改版被数据验证过的核心收益（[Duolingo Blog](https://blog.duolingo.com/new-duolingo-home-screen-design/)）。
2. **路线本身即连胜**。已走过的路段永久点亮，断卡不熄灯、不清零任何东西。连续性用「足迹 + 周窗」表达（本周推进 4 次），彻底规避火焰连胜的焦虑与愧疚机制（详见反模式 #1）。
3. **庆祝 = 停顿 + 物证，不是粒子**。仪式分三档（微反馈 / 阶段印记 / 登顶拼合），最高档总时长 ≤4 秒且以一拍「静默」开场。撒花式庆祝已被多个 UX 研究认定为廉价且干扰（[UX Collective](https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19)）。
4. **未解锁 ≠ 灰色死区**。后续阶段以「云雾」渐隐：阶段名和一句「为什么」可见，任务细节不可见——给期待感，不给信息过载，也不给「一堆灰色任务」的压迫感。
5. **生成等待是开箱仪式，不是加载条**。问卷提交后进入 15 秒左右的四幕叙事等待（汇集信息 → 对照同方向路径 → 编排阶段 → 校准资源），完成后路线一笔画成。等待要诚实分步、可离开、可跳过（[Telerik AI 加载模式](https://www.telerik.com/blogs/loading-ui-ux-patterns-ai-applications)）。

### 1.4 核心画面清单（本报告后续逐个展开）

- 路线总览页：纵向蜿蜒 SVG 路径 + 8 个垭口节点 + 当前阶段活跃卡（第 4 节）
- 阶段详情页：章节化排印，学 / 练 / 创 / 验四拍节奏（第 2.3、4.2 节）
- 验收仪式：静默一拍 → 逐项盖「过」印 → 印记落下 → 路线 draw-on 延伸 → 云雾散开（第 5 节）
- Onboarding：单题分屏问卷 + 提交前回顾屏 + 四幕生成等待（第 6 节）

---

## 二、多邻国底层原则拆解：舒服在哪一层

### 2.1 背景：2022 年从技能树到线性路径

2022 年 11 月 1 日，多邻国把经典的技能树（多技能并行解锁、用户自选学什么）全面替换为单条蜿蜒的线性路径。官方理由非常直白：大量学习者反馈「不确定自己是否在正确地使用多邻国」——**选择的自由变成了决策的负担**（[官方博客](https://blog.duolingo.com/new-duolingo-home-screen-design/)）。

这次改版是罕见的「用 A/B 测试赢下口碑争议」的案例：路径在留存指标上全面胜出后才全量上线。外界的拆解（[CNET](https://www.cnet.com/tech/services-and-software/8-changes-duolingo-made-for-easier-language-learning-in-2022/)、[Duoplanet](https://duoplanet.com/duolingo-new-learning-path-review/)）指向同一组底层设计决策。

### 2.2 五个可迁移的底层原则

**原则 1：消灭「学什么」的选择（选择悖论的解法）**
技能树时代用户每次打开 App 都要做一次决策：学哪个技能？决策本身消耗意志力，且「不确定有没有用」的隐忧持续存在。路径版把这个决策彻底拿掉——系统替你排好了最优顺序。认知科学层面，这就是降低外在认知负荷：可选项过多时大脑会推迟甚至放弃决策（[Medium 认知负荷分析](https://t-i-show.medium.com/design-for-learning-apps-ux-research-and-case-study-on-duolingo-1800d33744c9)）。
对我们的意义：**更强**。多邻国的路径是给所有人的同一条，我们的路径是按个人问卷生成的——「专属路线」让我们有资格把线性做得更彻底。界面上的表达是：路线页永远只有一个可交互的「当前节点」，历史节点可回看、未来节点只可预览名称。

**原则 2：复习不是「回去」，而是前进的一部分（间隔重复内置）**
旧版用户习惯把一个技能刷满金色再前进，官方推荐的「悬停复习法」需要用户自觉执行。新版把复习节点直接铺进路径里，「复习即前进」。
对我们的意义：极重要且常被忽略。8 阶段的长路线，前期作品（比如阶段 2 的 Java 项目）应该在阶段 5 的任务里被要求迭代一次——把「回访旧知识」设计成后续阶段的正式任务，而不是指望用户自觉复习。

**原则 3：单元小型化 + 描述性标题**
改版把课程切成更小的单元，标题从「City 3」改为「get directions」这类能力描述。
对我们的意义：阶段命名必须是**可验收的能力陈述**（「能独立完成一个 RAG 应用的搭建与调优」），而不是知识分类（「大模型基础」）。标题本身就是验收标准的预告，也是用户向他人解释自己在干嘛的语言。

**原则 4：蜿蜒路径的「旅程感」优于网格的「清单感」**
CNET 的观察值得记住：技能树是刚性的格子，路径的蜿蜒让它「更像一段旅程」，回看已走过的蜿蜒路段本身就是自信心的来源（[CNET](https://www.cnet.com/tech/services-and-software/8-changes-duolingo-made-for-easier-language-learning-in-2022/)）。
对我们的意义：路线主视觉必须是一条**连续的线**，而不是 8 张卡片的堆叠。连续性（continuity）是「闯关感」的最小成本来源——用户看到的不是待办清单，而是一条已经开始、正在延伸的路。

**原则 5：即时反馈的时机分层**
多邻国的反馈分两个时机：答题瞬间（<400ms 的对错横幅，不打断操作流）与课程结束时（结算屏：经验值计数、连胜更新、目标进度环）。原则是：**过程反馈零延迟、总结反馈延迟到节点末**，不在过程中插入总结性打断。
对我们的意义：任务勾选是零延迟微反馈（勾 + 足迹落定，≤300ms）；「你已完成阶段 3 的全部任务」这类总结只在阶段末的验收节点出现。不要在每个小任务后弹总结屏。

### 2.3 多邻国的节奏结构（单元内四拍）与我们的映射

多邻国单元内的节奏大致是「学 → 练 → 测 → 叙」（新知 → 练习 → 单元测验 → 角色动画过场松一口气）。映射到我们的阶段内任务编排：

| 多邻国节拍 | 我们的节拍 | 界面表达 |
|---|---|---|
| 学（新课程） | 学：资源与讲解 | 输入型任务卡（冷色标） |
| 练（练习题） | 练：随堂实践 | 输出型任务卡（暖色标） |
| 测（单元测验） | 创：提交阶段作品 | 作品提交卡 + 材料上传 |
| 叙（过场动画） | 验：阶段验收 | 验收清单 + 印记仪式 |

### 2.4 必须警惕的教训（多邻国的翻车面）

- **强制线性引发老用户反弹**：有基础的用户无法跳级，社区怨声载道（[Duoplanet](https://duoplanet.com/duolingo-new-learning-path-review/)、[Farah Hariri 的复盘](https://medium.com/@farahhariri/duolingos-app-update-2022-breaking-boundaries-f4abbde429d0)）。对策：我们保留「免修申请」——已有基础的用户可对该阶段发起校验（做一道该阶段的验收题），通过即盖章跳过。这既尊重现实，又让验收标准反向变得可信。
- **连胜 + 愧疚通知是黑暗模式**：「这些提醒不会来抓你」的猫头鹰被 UX 社区点名批评为情绪操纵（[UX Design.cc](https://uxdesign.cc/the-good-the-bad-and-the-ugly-of-duolingo-gamification-3a12f0e80dc7)、[The Decision Lab 的「连胜蠕变」分析](https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification)）。我们不碰日连胜、不碰损失厌恶文案。
- **XP / 心 / 联盟 / 排行榜**：商业化与社交裂变的工具，与「拿 offer」的严肃目标无关，全部不要。

---

## 三、参照产品深拆

> 以下每款按「界面印象 → 可借鉴 → 不借鉴」三段展开。界面印象为基于公开资料与产品现状的描述，用于内部对齐。

### 3.1 Headspace（冥想课程旅程）

**界面印象**：首页是柔和的圆角卡片流，「今日推荐」占据视觉中心；课程以「dots 路径」呈现——一列原点代表每次冥想，完成的点被点亮并连成一段；全程使用低饱和的橙蓝奶油色系、无棱角曲线、非人形角色；新手引导流为「欢迎 → 经验与时长 → 目标设定 → 时间与提醒 → 回顾」五步（[Raw Studio 对 Headspace 设计的深度拆解](https://raw.studio/blog/how-headspace-designs-for-mindfulness/)、[MetaLab 案例](https://www.metalab.com/work/headspace)）。

**可借鉴**
- **引导流的「回顾屏」**：问卷最后一步不是提交，而是「这是你告诉我的」一屏汇总、可修改，然后才开始定制。这是承诺一致性的经典应用，我们 Onboarding 直接采用（详见第 6.1 节）。
- **点亮的路径段**：课程 dots 的「完成即点亮并连线」，本质上和我们的路线点亮同构，验证了这种表达的舒适度。
- **抽象角色传递情绪**：不画真实人像、用形状与色彩隐喻状态（愤怒 = 蒸汽与闪电），「怪异更易共鸣」。我们的「云雾」「垭口」同样走抽象地形符号而非人物插画。
- **北极星指标的克制**：Headspace 以「第 2 周留存」为唯一北极星（过此关者付费转化高 5 倍），为此敢砍掉首课环节让用户先进门。我们的路线页也应只为「第 2 周仍在推进」优化，不为单日打开次数优化。

**不借鉴**：奶油色系与圆润萌系气质（过于疗愈，撑不起「求职上岸」的分量）；卡通角色生态（我们有「向导」人格但只以克制的文字与符号出现）。

### 3.2 Apple Watch 活动圆环（Apple Fitness+ 的进度核心）

**界面印象**：三同心圆环（活动 / 锻炼 / 站立），随行为实时充盈，闭合瞬间有放大定格与触觉反馈；每日午夜重置；另有「每周摘要」与里程碑奖赏（最长连胜、完美月）。其心理学拆解（[Trophy.so 的圆环心理学](https://trophy.so/blog/the-psychology-of-apple-watchs-close-your-rings)）非常完整：格式塔闭合（90% 的环是潜意识里的「未闭合回路」）、目标梯度效应（越接近完成动力越强）、损失厌恶（护连胜）、渐进披露（圆环是低摩擦钩子，图表藏在深层）。

**可借鉴**
- **「闭合」作为完成的视觉语义**：接近完成时的视觉张力是自驱的。我们阶段任务的验收清单（如 5 项过 4）天然是「待闭合」结构——清单本身就是进度环的等价物，不需要再画一个环。
- **自适应目标（达成率锚定 70-80%）**：根据前 1-2 周实际行为调目标。我们的阶段时长应按用户实际节奏动态微调（阶段 1 超时 → 系统悄悄放宽后续阶段预估，而不是标红「落后」）。
- **里程碑分层**：7 / 30 / 365 天式纪念。对应我们：第 1 枚印记、前 4 枚（半程纹章）、8 枚（完整纹章）。
- **连胜保护（streak freeze）**：可预支的「休整券」，缺席不清零。

**不借鉴**：每日重置的压强（我们改为周窗节奏）；三环多目标并行（我们是单主线，多环会让用户分散自责）。

### 3.3 Nike Run Club（训练计划的呈现）

**界面印象**：与设计公司 Collins 合作的改版把「音频教练跑」收敛为 Everyday / Speed / Long 三大框架，用色彩编码区分当日训练类型；不同类型的封面卡允许差异化的表达——Speed 类用大字号节奏感排版、Long 类用层叠剪影营造耐力的「出神」感；训练计划以周为单位推进，每周有明确的「当日训练」卡（[Print Magazine 的 Collins 改版案例](https://www.printmag.com/branding-identity-design/nike-run-club-app-improves-user-experience-with-help-from-collins/)）。

**可借鉴**
- **「结构理性、局部感性」**——这是本次调研中对我们气质定义最有用的一句话：整体框架极端克制（三分类、色彩编码、可复用系统），但在每个局部允许一段有表现力的表达。我们的路线页整体是纪律化的排印，唯独当前阶段卡可以有一段「有感」的呈现（地形纹理、海拔数字、当日任务的呼吸感动效）。
- **色彩编码任务类型**：输入型任务（学）与输出型任务（练 / 创 / 验）用两种克制的色标区分，用户扫一眼就知道今天是输入日还是输出日。
- **教练存在感来自内容而非界面**：NRC 的陪伴感靠教练声线与文案，界面只负责「让你容易找到」。我们的 AI 向导同理：在卡壳、开题、验收三个时刻以克制文案出现，不常驻弹窗。

**不借鉴**：明星教练人设体系；大面积鞋底纹理等强品牌视觉。

### 3.4 Things 3 / Structured（精致进度类的状态设计）

**界面印象**：Things 3 是「彻底克制」的标本——无进度条、无百分比、无红色徽章，区域只有 Today / Upcoming / Anytime；勾选完成时是一个短促的小圆扩散动画（约 300ms 的弹性），完不成没有任何惩罚性视觉；字体排印与留白是它的全部装饰（[Pratt 的设计批评](https://ixd.prattsi.org/2020/02/design-critique-things-3-ios-app/)）。Structured 则把一天画成一条纵向时间轴，任务按时间落位、以彩色小图标标记类型，整体气质偏可爱贴纸风（[Structured 官网](https://structured.app/)）。

**可借鉴**
- **完成动效的「短促有力」**：Things 的勾选动画是行业标杆——不是渐变淡出，而是一个有质量感的弹性形变。我们的任务勾选照此标准做（详见 5.2 节微反馈规格）。
- **无惩罚的默认状态**：今天没做完，任务只是平静地移到明天，没有任何红色。我们路线页对「落后于预估」的唯一表达是「重新校准」，永远不标红。
- **纵向时间轴的节奏感**（Structured）：单列、按序、留白均匀——路线页移动端布局的直接参照。

**不借鉴**：Things 面向单日任务、不提供长程里程碑感，我们的 8 阶段必须有「位置感」；Structured 的贴纸可爱风与我们的分量感冲突。

### 3.5 Codecademy / Brilliant / Coursera / LinkedIn Learning（课程路径 UI 现状）

**Codecademy（2023 职业路径改版）**
界面印象：改版把「几十节课的长滚动列表」拆为「职业路径大纲（Syllabus）→ 单元大纲 → 课程 / 项目」三层；每个主题明确标注所学技能；进度追踪被调优为「每完成一节课、一次测验，进度即增长」——官方承认旧版「学了几个小时，进度条只动了一点点」伤害动力（[Codecademy 官方博客](https://www.codecademy.com/resources/blog/career-path-redesign)）。
可借鉴：**三层大纲结构**（总路线 → 阶段 → 任务）与我们的信息架构完全同构；**进度粒度细化到任务级**是直接教训——阶段进度 = 已完成任务 / 总任务，验收清单逐项可见。
不借鉴：无显著视觉语言（工具感强、旅程感弱）。

**Brilliant**
界面印象：课程以分支路径图呈现，节点间有明确的先后连线，当前节点放大居中，每节是交互式小练习；整体由 ustwo 以「UX × 游戏设计原则」打造（[ustwo 案例](https://ustwo.com/work/brilliant/)、[Screens Design 拆解](https://screensdesign.com/showcase/brilliant-learn-by-doing)）。
可借鉴：**点击未来节点先给预览**（这节你会学到什么）——我们的云雾阶段点击后弹出「为什么这个阶段在这」的预告卡。
不借鉴：游戏化积分体系；分支结构（我们是单主线 + 可选支线，不做全开放分支图）。

**Coursera / LinkedIn Learning**
界面印象：Coursera 是模块列表 + 每课圆环进度，信息完整但像教务系统；LinkedIn Learning 是视频列表 + 顶部细进度条，最平淡但焦虑感最低。
可借鉴：低焦虑（进度表达克制、无倒计时）；Coursera 的「每周视图」适合我们路线页的阶段分组。
不借鉴：教务系统气质；视频中心的组织方式（我们以任务与作品为中心）。

### 3.6 MasterClass / Khanmigo（高端教育与 AI 导师）

**MasterClass**
界面印象：电影化的暗色界面、全幅名师海报、衬线大标题，课程像剧集而非课件（[Screens Design 拆解](https://screensdesign.com/showcase/masterclass-become-more-you)）。
可借鉴：**衬线大标题 + 细体编号的「分量感」排印**——我们阶段标题（第叁章 · 能力陈述）直接采用这种字重对比；暗色场景下「一屏一焦点」的节奏。
不借鉴：以名人视频为中心的结构；过重的电影级暗色（我们主线是明亮纸感，暗色留作证书页）。

**Khanmigo（可汗学院 AI 导师）**
界面印象：对话式苏格拉底导师，克制的学术气质，AI 以引导提问而非给答案的方式陪伴（[Khan Academy 官方博客](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/)）。
可借鉴：向导的「引导式」语气规范——在用户卡壳时先问「你现在卡在哪一步」，不直接倾倒方案。
不借鉴：全程对话式交互（我们的主线操作必须按钮化、低门槛，对话只作为辅助通道）。

### 3.7 Linear / Notion（「高级感」的设计语言要素）

**Linear**
界面印象：单一 Inter 可变字族、收紧的字距、4px 基准栅格、约 200ms 的动效时长、高信息密度 + 紫色唯一强调色；改版自述目标是「降低视觉噪音、保持对齐、提升层级与密度」（[Linear 官方改版记](https://linear.app/now/how-we-redesigned-the-linear-ui)、[设计系统拆解](https://www.designmd.supply/guides/linear.app)）。
可借鉴（这是我们的呈现层规范）：单一主字族（中文思源宋 / 黑双字族，绝不三种以上）；4/8px 间距纪律；**动效时长全站只有一档基准（200ms）加仪式档（600-900ms）**，杜绝「每个组件自带不同时长」的混乱；强调色只允许一种（建议墨绿或暗金），只在「当前 / 已完成」状态处出现。
不借鉴：工具类的高密度多列布局（我们的阶段详情是阅读型单列）。

**Notion**
可借鉴：安静的默认配色与清晰的排版层级；「内容为主、容器为辅」的页面观感。
不借鉴：无观点的灵活性——Notion 给你空白页让你自己搭，我们的核心价值恰是「系统有主见地替你排好」，界面要传达这种确定性。

---

## 四、路线可视化隐喻候选对比与推荐

### 4.1 候选对比表

评分：●●● 高 / ●●○ 中 / ●○○ 低

| 候选隐喻 | 语义契合（求职升学=向上抵达） | 气质契合（精致克制有分量） | 解锁感与期待管理 | 移动端适配 | 实现成本（Web） | 先例 | 判定 |
|---|---|---|---|---|---|---|---|
| A 等高线山径（垭口/云雾/登顶） | ●●● | ●●● | ●●●（云雾渐进揭示） | ●●●（纵向蜿蜒） | ●●○（SVG path + 状态类） | Strava 海拔剖面、徒步类 App；教育产品罕见 | **主隐喻（推荐）** |
| B 章节书目录（成长之书） | ●●○ | ●●●（排印即全部） | ●○○（需补解锁机制） | ●●● | ●○○（纯排版） | 少见，差异化机会大 | **结构层采用** |
| C 护照印章（印记拼合） | ●●○（物证语义） | ●●● | ●●●（收集+拼合终局） | ●●● | ●●○（SVG 印章 + 动效） | 旅行 App、习惯 App 常见单点使用 | **物证层采用** |
| D 地铁线路图 | ●●○（换乘≠成长） | ●○○（通勤工具感） | ●●○ | ●○○（横向难纵排） | ●●○ | 密歇根大学课程旅程图、部分 LMS | 不推荐 |
| E 星座航道图 | ●○○（抽象，与目标无涉） | ●●●（暗色高级） | ●●●（点亮成图） | ●●○ | ●●○ | 各类技能图谱、太空题材产品 | 备选，风险：crypto 感 |
| F 时间轴河流 | ●○○（时间流逝≠努力积累） | ●●○ | ●●○ | ●○○（横向） | ●●○（需 canvas/复杂 SVG） | 复盘类叙事产品 | 不推荐主视觉；档案页「年轮」可借用 |

### 4.2 推荐方案：A + B + C 组合（「山径 · 印记」）

**单独任何隐喻都不够。** 山径负责语义与推进感，章节书负责内容排印的分量，印章负责完成时刻的物证。三者组合才是完整的交互语言：

**路线总览页（核心画面）**
- 主体是一条**纵向蜿蜒的 SVG 路径**，自上而下穿过 8 个阶段节点（垭口符号 + 罗马数字编号 + 能力陈述标题）。纵向是移动端唯一正确选择——多邻国路径同样纵向，拇指滚动即推进。
- **已走过段**：实线，墨绿色，永久点亮；线上散布当天活跃留下的「足迹」小刻痕（这是连续性可视化的主体）。
- **当前阶段**：节点放大为「活跃卡」——阶段名、本周任务数、唯一主按钮「继续」。自动滚动定位到视口上三分之一处。
- **未解锁段**：虚线没入浅色「云雾」遮罩；阶段名 + 一句「为什么此时学它」可见，任务细节不可见。点击弹预告卡（借 Brilliant 的预览模式）。
- 页面底部路径延伸出屏，暗示路还在继续；终点处一枚「登顶」旗标 + 目标陈述（你的 goal 原话）。
- 背景：极淡的等高线纹理（5% 以下透明度），这是「地形图气质」与「卡通山」的分界线——**我们画的是地图，不是山的插画**。

**为什么不选地铁图**：换乘语义与成长无关，横向布局在手机上是灾难，且通勤气质与「人生路径」的分量感相反。
**为什么慎选星图**：好看且高级，但「星象」与「努力」之间没有因果隐喻，18-24 岁用户对星空视觉已有 crypto / 科技发布会式的审美疲劳；若未来做暗色模式可作次要皮肤。
**河流 / 年轮的归宿**：时间轴河流的问题是「时间在流而人可以不努力」，语义反了。但「年轮」非常适合**档案页的长期回顾视图**——8 个月后回看， concentric 年轮上每圈刻着一个月的足迹密度，这是复盘时刻的第二视图，不进主线。

### 4.3 阶段详情页（章节化排印）

借 Codecademy 三层大纲 + MasterClass 分量排印：

- 章头：罗马数字（Ⅰ-Ⅷ）+ 衬线大标题（能力陈述）+ 一行「为什么是现在」（与前后阶段的因果，把 8 个阶段缝成一个论证）。
- 内容四拍分区：「学什么」（资源卡：每类资源只推荐 1 个主编 + 2 个备选折叠——编辑部式选择，反「10 个链接全平铺」）；「实践任务」（任务清单，输入 / 输出色标）；「阶段作品」（提交入口）；「验收标准」（可勾选清单，就是那枚「待闭合的环」）。
- 底部 sticky：进度（任务 3/7）+ 主按钮。

---

## 五、仪式感与动效设计原则

### 5.1 为什么撒花是廉价的：论证

UX 社区已有明确结论：庆祝的目的不是让屏幕热闹，而是**让用户确认自己的进展**；礼花是可选的，且过度使用（Dribbble 上 1600+ 个 confetti 设计）已使其成为廉价的默认（[The over-confetti-ing of digital experiences](https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19)、[Why Confetti Celebrations Backfire](https://uxplanet.org/why-confetti-celebrations-backfire-and-how-to-make-them-work-be838a6e7b8b)）。粒子轰炸的问题在于：无重量、无物证、无法区分大事小事（完成一节课和拿 offer 用同一种礼花）、且不可分享。

我们的替代公式：**重量感（印章 / 墨 / 纸的物理隐喻） + 停顿（仪式前的静默拍） + 物证（可回看可分享的印记）**。

### 5.2 三档仪式规格

**第一档：微反馈（日常，每次任务勾选）**
- 勾选框弹性形变（Things 3 式短促动画，≤300ms，spring 曲线）+ 路线上落定一枚足迹刻痕（150ms 淡入）+ 一段微光沿路线流向下一任务（400ms，可选）。
- 全屏元素：零。弹窗：零。这是「不打断心流的过程反馈」（多邻国原则 5）。

**第二档：阶段印记（验收通过时）**
总时长 ≤4 秒，节奏剧本：
1. **静默一拍（200ms）**：验收结果页先出现，只有清单与「通过」字样，无任何动效——这一拍是「高级感」的来源，对比礼花的无缝轰炸。
2. **逐项盖印（每项 250ms）**：验收清单每一项依次落下一枚小小的「过」印（缩放 1.3→1 + 2° 旋回 + 墨色加深），配轻微触觉（移动端 navigator.vibrate 单脉冲 ≤20ms）。
3. **阶段印记落下（800ms）**：本阶段的大印记（印章动画：1.6x → 1 缩放、-8° → 0° 旋回、落定瞬间墨晕向外扩散 12px 后收敛；easing 用 expo-out）。印记图案是该阶段的图形符号（如阶段Ⅲ是「齿轮与对话气泡」）。
4. **路线延伸（1.5s）**：视图切回路线总览，新路段 draw-on 一笔画出（stroke-dashoffset 过渡），到达下一垭口。
5. **云雾散开（600ms）**：下一阶段从雾中显影，标题浮现。
6. 唯一按钮：「进入下一阶段」。全程可点击任意处跳过。
- 声音默认关闭，提供克制的单音（木鱼 / 印章落纸的闷响）作为可选。

**第三档：登顶（全程完成）**
- 8 枚印记从四散位置飞向中心、旋转拼合为完整纹章（stagger 编排，每枚 120ms 间隔）→ 纹章整体一次呼吸式脉冲 → 登顶证书展开（纸质感、衬线字体、姓名 + 路线名 + 起止日期 + **唯一编号 + 可验证链接**）。
- 可下载 SVG/PDF、可生成分享卡（社区晒 offer 季的自然传播物料）。
- 编号与可验证性是「有分量」的关键：真证书有序号，游戏成就没有。

### 5.3 连续性可视化：路线即连胜

- **已点亮路段 = 不可剥夺的积累**。断卡三天，路还是亮的，足迹还在。这是对火焰连胜机制的根本性替代：我们把「连续」的载体从「天数」改为「路程」——路程只增不减。
- 辅助视图：当前阶段卡上一行「本周推进 4 次」（周窗，非日连胜），配 7 格小灯（周一至周日，点亮为足迹色）。
- 「休整」机制（借 Apple 的 streak freeze）：用户可预支休整周（考试周），休整期间周窗显示「休整中」而非空白，不清零、不补偿、不愧疚。
- 若用户中断后回归：回归页文案只做一件事——「你已走到阶段Ⅴ，从任务 3 继续」，绝不展示「你已离开 23 天」。

### 5.4 动效三纪律（来自 Linear 与反模式研究）

1. **一次只有一个动效焦点**。印记落下时，其他一切静止；路线延伸时印记已完成。绝不同时两个以上元素在动。
2. **全站只有两档时长**：常规交互 200ms（对齐 Linear 基准）、仪式主体 600-900ms、路线 draw-on 1.2-1.5s 是唯一的例外档。
3. **所有动效可降级**：prefers-reduced-motion 下全部替换为 ≤150ms 的淡入 + 文字状态（「已通过 · 阶段Ⅲ」），仪式的语义不依赖动效存在（详见 7.4）。

---

## 六、Onboarding 与「生成中」等待设计

### 6.1 问卷：单题分屏 + 零打字原则

行业共识明确：分段提问（一次一题）显著降低认知负荷并提升完成率，每段不超过 1-3 题、避免双载问题（[Userflow](https://www.userflow.com/blog/how-to-make-user-onboarding-surveys)、[Formbricks](https://formbricks.com/blog/ux-survey-questions)、[Appcues 的渐进披露策略](https://www.appcues.com/blog/user-onboarding-surveys)）。结合 Headspace 的五步引导经验，我们的问卷设计：

**题目序列（≤6 题，每题单屏）**
1. **目标**（情感承诺时刻，放最先）：大字选择卡（Java 后端→AI 应用 / 保研 / 考公 / 出国 …），支持搜索。卡片上是目标的一句话白描（「从 CRUD 到 Agent 工程师」）。
2. **现状自评**：滑块 + 文字锚点（「能独立写 CRUD 接口」↔「刚学完语法」）——锚点必须具体到作品级描述，否则自评无意义。
3. **已有技能**：chip 多选（可跳过）。
4. **可用投入**：选择卡（每天 1h / 每天 2-4h / 周末冲刺型）。
5. **期望期限**：选择卡（含「按系统建议」默认项——把决策权还给系统，呼应原则 1）。

**输入方式选用规则**：目标 / 投入 / 期限 = 选择卡（点选成本最低）；自评 = 滑块（连续量 + 锚点）；技能 = chips；自由文本仅一个可选的「还有什么想告诉向导」。**移动端零强制打字。**

**交互细节**：顶部细进度条（5 段）；每题可返回修改；答案本地暂存（意外退出不重来）。

**提交前「回顾屏」**（借 Headspace）：「这是你告诉我的」——一屏汇总全部答案、每项可点改。这一屏有两个作用：用户纠错（提高路线质量）+ 公开承诺（提高粘性）。点「开始制定」后才进入等待。

### 6.2 「AI 正在制定路线」：四幕等待仪式

这是隐藏式 Agent 产品最关键的时刻。理论依据：等待体验的本质是感知管理（[Telerik AI 加载模式](https://www.telerik.com/blogs/loading-ui-ux-patterns-ai-applications)）；「展示工作过程」比黑盒出结果更能提升价值感知（operational transparency / labour illusion，Buell & Norton 2011, Management Science；亦见 [CHI 2025 对 AI 场景等待感知的研究](https://dl.acm.org/doi/10.1145/3706599.3719725)）。

**四幕剧本（总 12-15s，设计化的节奏等待）**
- 幕一（0-3s）「正在汇集你的目标与现状」：问卷答案卡片飞入、聚拢成一组。
- 幕二（3-7s）「正在对照同方向的上岸路径」：一束抽象的路径线在屏幕上汇聚到一条。
- 幕三（7-11s）「正在编排 8 个阶段与验收点」：8 个节点依次落位成路线轮廓（此时只有骨架，无内容——分步揭示）。
- 幕四（11-14s）「正在为你挑选资源与任务」：资源卡片薄片依次叠入各阶段。
- **揭晓（14-15s）**：全路线一笔 draw-on 呈现 + 「你的专属路线已就绪」+ 首阶段卡 + 主按钮「从阶段Ⅰ开始」。

**五条纪律**
1. **诚实性**：四幕对应后端真实管线阶段（汇集 → 检索 → 编排 → 填充），文案与实际步骤一致；若人为放慢节奏，展示的是「编排的顺序」而非伪造的进度百分比。
2. **可离开**：提供「先去逛逛，好了叫我」——后台生成完成后站内通知（长等待的后台任务模式，Telerik 同款建议）。
3. **可跳过**：动画点击即跳到骨架态（对性急的用户，等待动画是负担）。
4. **不转圈**：绝对不出现 spinner——骨架屏与叙事分步替代之（[Stop Using a Loading Spinner](https://uxdesign.cc/stop-using-a-loading-spinner-theres-something-better-d186194f771e)）。
5. **失败态有尊严**：生成失败时展示「已收集好的信息仍在」，一键重试，绝不让用户重答问卷。

---

## 七、技术实现建议（Web 端，不用原生 App）

### 7.1 动效技术选型

| 需求 | 选型 | 理由 |
|---|---|---|
| 组件微交互（勾选 / 卡片 / 手势） | **Motion（原 Framer Motion，2025 起框架无关）** | React 生态最顺、声明式、spring 物理动画、包体可控（[官方对比](https://motion.dev/docs/gsap-vs-motion)） |
| 页面 / 视图过渡（路线页 ↔ 阶段页） | **View Transitions API**，渐进增强 | 2025 年 10 月起 Baseline Newly Available，零依赖做元素级过渡（阶段卡 → 阶段详情的展开感）；不支持时回退为普通路由 + 淡入 |
| 路线 draw-on | **原生 SVG + CSS**（stroke-dasharray / dashoffset，pathLength=1 归一化） | 无需任何库，多段用 transition-delay 编排 |
| 滚动叙事（阶段卡入场） | **CSS scroll-driven animations**，渐进增强 | Chrome 115+ 已可用、Safari 26 起支持；用 @supports (animation-timeline: scroll()) 包裹（[Smashing Magazine](https://www.smashingmagazine.com/2024/12/introduction-css-scroll-driven-animations/)、[Can I use](https://caniuse.com/wf-scroll-driven-animations)） |
| 登顶拼合等复杂时间轴 | Motion 的 staggerChildren 即可；**GSAP 非必需** | GSAP 已免费开源，但为单一场景引入不划算；若未来营销首页要做 pin/scrub 再引入 |

原则：**能用 CSS 的不用 JS，能用原生 API 的不引库**。路线页的全部常驻动效（draw-on、点亮、足迹）都是 SVG + CSS，JS 只负责状态类切换。

### 7.2 路线图实现规格

- 纯 SVG（path + circle + text），路线为单条 path（pathLength=1），完成度用两个叠加 path（底层灰虚线全长、上层实线 dashoffset 控制点亮长度）。
- 移动端：纵向布局，节点点击热区 ≥44px；桌面上限容器宽 720px 居中，两侧留白放阶段旁注。
- 长页面性能：只渲染视口 ±2 个阶段的详细卡，其余为骨架节点（IntersectionObserver 挂载）。
- 云雾遮罩：SVG 内 feTurbulence 慎用（性能差），改为预生成的半透明噪声 PNG/WebP 叠加 + CSS mask 过渡。

### 7.3 动效规格表（可直接进设计系统）

| 场景 | 时长 | 曲线 | 属性 |
|---|---|---|---|
| 按钮按压 / 勾选 | 120-150ms | ease-out | scale 0.97→1、勾选 spring |
| 常规元素移动 / 显隐 | 200ms | cubic-bezier(0.2, 0, 0, 1) | opacity / transform |
| 容器过渡（阶段卡展开） | 320ms | expo-out | transform + clip-path |
| 印章落下 | 800ms | expo-out（缩放）+ spring（旋回） | scale 1.6→1、rotate -8°→0 |
| 路线 draw-on | 1200-1500ms | ease-in-out | stroke-dashoffset |
| 云雾散开 | 600ms | ease-out | opacity + blur(6px→0) |

只动画 transform / opacity / stroke-dashoffset（+ 可接受的 filter），绝不动画 layout 属性。

### 7.4 无障碍与降级

- 全局 `@media (prefers-reduced-motion: reduce)`：所有动效替换为 ≤150ms 淡入，印章改为静态盖印态 + 文案「已通过」（[W3C WCAG 2.2 Technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)、[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)、[web.dev](https://web.dev/articles/prefers-reduced-motion)）。
- 产品内提供手动动效开关（多数用户不知道系统设置的存在）。
- 点亮线与背景对比度 ≥3:1；印记语义同时有文字冗余（不是只有图形）。
- 移动端触觉：navigator.vibrate 仅在印章落定处用 ≤20ms 单脉冲，且跟随系统无障碍设置。

---

## 八、反模式清单（教育成长产品翻车实录）

| # | 反模式 | 翻车案例 | 我们的对策 |
|---|---|---|---|
| 1 | 日连胜 + 断签清零 | 多邻国「愧疚猫头鹰」被定性为情绪操纵式黑暗模式，用户因连胜焦虑弃用（[UX Design.cc](https://uxdesign.cc/the-good-the-bad-and-the-ugly-of-duolingo-gamification-3a12f0e80dc7)、[The Decision Lab](https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification)） | 连续性载体 = 路程（只增不减），周窗 + 休整券，回归页不显示离开天数 |
| 2 | 满屏礼花庆祝 | confetti 滥用已成廉价默认（[over-confetti-ing](https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19)） | 三档仪式，静默开场，重量感物证 |
| 3 | 进度条长年不动 | Codecademy 旧版「学几小时进度条只动一点」官方承认伤害动力（[官方博客](https://www.codecademy.com/resources/blog/career-path-redesign)） | 进度粒度到任务级；验收清单即待闭合环 |
| 4 | 强制线性、有基础不能跳 | 多邻国改版后老用户反弹（[Duoplanet](https://duoplanet.com/duolingo-new-learning-path-review)） | 免修申请：通过该阶段校验题即盖章跳过 |
| 5 | 横向路线图塞进手机 | 各类地铁图式 LMS 在移动端需横滑 | 纵向蜿蜒路径，滚动即推进 |
| 6 | 未解锁内容全灰置 | 大片灰色任务产生「永远做不完」压迫 | 云雾遮罩：名称可见 + 一句为什么，细节渐显 |
| 7 | 游戏皮肤错配严肃场景 | 卡通角色 + XP 出现在求职产品中气质断裂 | 语义自洽的征途语言：地图、印章、纸感 |
| 8 | 动效过载 | 多元素同时运动、视差 + 粒子 + 震动齐上，引发前庭不适（[Smashing 减动效设计](https://www.smashingmagazine.com/2020/09/designing-reduced-motion-for-motion-sensitivities/)） | 一次一个动效焦点；两档时长；全量 reduced-motion 降级 |
| 9 | 生成等待黑盒 / 假进度 | spinner 转圈 + 假百分比，感知等待更长且损害信任（[Stop Using a Loading Spinner](https://uxdesign.cc/stop-using-a-loading-spinner-theres-something-better-d186194f771e)） | 四幕真实分步叙事 + 可离开 + 可跳过 + 失败不重答 |
| 10 | 假选择（10 个资源全平铺） | 「推荐资源」变成书签堆，选择负担回流 | 编辑部式单选：1 主编 + 2 折叠备选 |
| 11 | 多目标并行（三环式多线打卡） | 用户在多个未完成指标间分散自责 | 单主线；周窗是唯一辅助指标 |
| 12 | 通知轰炸 | 损失厌恶文案式推送（「你的连胜要没了」） | 通知仅在「生成完成」「验收提醒（用户自设）」两类场景，文案只指向前方 |

---

## 九、参考链接

**多邻国**
1. Duolingo Blog — Introducing the new Duolingo learning path: https://blog.duolingo.com/new-duolingo-home-screen-design/
2. CNET — 8 Changes Duolingo Made in 2022: https://www.cnet.com/tech/services-and-software/8-changes-duolingo-made-for-easier-language-learning-in-2022/
3. Duoplanet — New Learning Path Honest Review: https://duoplanet.com/duolingo-new-learning-path-review/
4. Farah Hariri (Medium) — Duolingo's App Update 2022: https://medium.com/@farahhariri/duolingos-app-update-2022-breaking-boundaries-f4abbde429d0
5. Medium (t-i-show) — UX Research and Case Study on Duolingo: https://t-i-show.medium.com/design-for-learning-apps-ux-research-and-case-study-on-duolingo-1800d33744c9
6. UX Design.cc — The good, the bad and the ugly of Duolingo gamification: https://uxdesign.cc/the-good-the-bad-and-the-ugly-of-duolingo-gamification-3a12f0e80dc7
7. The Decision Lab — Streak Creep: https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification
8. UX Magazine — The Psychology of Hot Streak Game Design: https://uxmag.medium.com/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame-3dde153f239c

**参照产品**
9. Raw Studio — How Headspace Designs for Mindfulness: https://raw.studio/blog/how-headspace-designs-for-mindfulness/
10. MetaLab — Headspace Case Study: https://www.metalab.com/work/headspace
11. Trophy.so — The Psychology of Apple Watch's Close Your Rings: https://trophy.so/blog/the-psychology-of-apple-watchs-close-your-rings
12. Print Magazine — Nike Run Club × COLLINS: https://www.printmag.com/branding-identity-design/nike-run-club-app-improves-user-experience-with-help-from-collins/
13. Pratt IXD — Design Critique: Things 3: https://ixd.prattsi.org/2020/02/design-critique-things-3-ios-app/
14. Structured 官网: https://structured.app/
15. Codecademy Blog — Career Path Redesign: https://www.codecademy.com/resources/blog/career-path-redesign
16. ustwo — Brilliant Case Study: https://ustwo.com/work/brilliant/
17. Screens Design — Brilliant UI Breakdown: https://screensdesign.com/showcase/brilliant-learn-by-doing
18. Screens Design — MasterClass UI Breakdown: https://screensdesign.com/showcase/masterclass-become-more-you
19. Khan Academy Blog — Building a Better AI Tutor: https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/
20. Linear — How we redesigned the Linear UI: https://linear.app/now/how-we-redesigned-the-linear-ui
21. DesignMD — linear.app Design Guide: https://www.designmd.supply/guides/linear.app
22. 密歇根大学 — Course Journey Maps（地铁隐喻先例）: https://ai.umich.edu/blog-posts/how-course-journey-maps-help-us-understand-student-success/

**庆祝 / 加载 / 问卷**
23. UX Collective — The over-confetti-ing of digital experiences: https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19
24. UX Planet — Why Confetti Celebrations Backfire: https://uxplanet.org/why-confetti-celebrations-backfire-and-how-to-make-them-work-be838a6e7b8b
25. Telerik — Loading UI/UX Patterns for AI Applications: https://www.telerik.com/blogs/loading-ui-ux-patterns-ai-applications
26. Pencil & Paper — UX Patterns: Loading Feedback: https://www.pencilandpaper.io/articles/ux-pattern-analysis-loading-feedback
27. UX Design.cc — Stop Using a Loading Spinner: https://uxdesign.cc/stop-using-a-loading-spinner-theres-something-better-d186194f771e
28. ACM CHI 2025 — While We Wait: How Users Perceive Waiting Times: https://dl.acm.org/doi/10.1145/3706599.3719725
29. Userflow — How to Make User Onboarding Surveys: https://www.userflow.com/blog/how-to-make-user-onboarding-surveys
30. Appcues — Onboarding Surveys: https://www.appcues.com/blog/user-onboarding-surveys
31. Formbricks — 50+ UX Survey Questions: https://formbricks.com/blog/ux-survey-questions

**技术实现**
32. Motion — GSAP vs Motion 官方对比: https://motion.dev/docs/gsap-vs-motion
33. dev.to — View Transitions API Becomes Baseline (2025.10): https://dev.to/linou518/view-transitions-api-native-browser-page-transitions-no-more-framer-motion-3g7d
34. Smashing Magazine — Introduction to CSS Scroll-Driven Animations: https://www.smashingmagazine.com/2024/12/introduction-css-scroll-driven-animations/
35. Can I use — Scroll-driven animations: https://caniuse.com/wf-scroll-driven-animations
36. W3C WCAG 2.2 — Technique C39 (prefers-reduced-motion): https://www.w3.org/WAI/WCAG22/Techniques/css/C39
37. MDN — prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
38. web.dev — Sometimes less movement is more: https://web.dev/articles/prefers-reduced-motion
39. Smashing Magazine — Designing With Reduced Motion: https://www.smashingmagazine.com/2020/09/designing-reduced-motion-for-motion-sensitivities/

（本报告中「operational transparency / labour illusion」相关论述另见 Buell & Norton, 2011, Management Science, "The Labor Illusion: How Operational Transparency Increases Perceived Value"。）
