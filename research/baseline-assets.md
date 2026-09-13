# 课搭（campus-market）V12.2 资产盘点报告 — 面向"结果型成长社区"转型

> 盘点对象：`/Users/wenhaoxuan/campus-market-baseline`（Next.js 14 全栈单项目，线上 kedahub.cn，git 最新提交 `d89f3a8`）
> 转型目标：首页改为"成长方向导航+科普"；核心新功能 = Agent 定制学习路线（闯关式）+ 阶段验收 + VIP 项目组社区；资料分享降为辅助。

## 一、数据模型（prisma/schema.prisma 全表清单）

文件：`prisma/schema.prisma`（30 个 model + 24 个 enum；迁移史见 `prisma/migrations/`，最新为 `20260910160000_v12_comments_checkins_dorm`）

| 表 | 结构要点 | 转型处置 |
|---|---|---|
| `Roadmap`（roadmaps） | title/summary/category(枚举6)/content **Json** `{phases:[{title,desc,steps:[{id,text,note?}]}]}`/stepsCount 冗余/mdSourceKey 原文/credentialKey 学生证/status 复用 WorkStatus 状态机 | **改造（核心）**：保留为"模板路线"，新增 per-user 实例表承载 Agent 定制路线；content Json 结构需扩字段（资源链接、验收标准、预计时长、依赖顺序） |
| `RoadmapWorkLink` | roadmapId↔workId + sortNo，唯一约束 | **复用**：闯关步骤"配套资料"直接沿用此模式（可泛化为 step 级关联） |
| `RoadmapFavorite` | userId+roadmapId 幂等收藏 | **复用** |
| `RoadmapCheck` | userId+roadmapId+stepId（`p{i}-s{i}` 稳定 id）+phaseIdx/stepIdx；勾=insert 取消=delete；唯一索引即进度查询索引 | **改造**：作为"勾选账本"复用；闯关制需加"阶段解锁/锁定"语义（新增字段或新表），且 stepId 引用 content 结构、发布后不可变是硬约束 |
| `DailyCheckin`（daily_checkins） | userId+day(YYYY-MM-DD, UTC+8)唯一、streakDays 写时计算（昨日+1/断签归1）、streakDays Desc 索引供排行榜 | **直接复用**：打卡账本与连续天数引擎，转型后"闯关推进"同样落账；排行榜口径已验证 |
| `Achievement` | key(AchievementKey 枚举)/emoji/title/rarity(bronze→lgd 六阶)/symbol/description | **改造**：字典与稀有度体系复用；**AchievementKey 是 Prisma enum，加"阶段通关/路线毕业/连续打卡N天"类成就需迁移**（且现有 17 键全围绕资料下载，无一个打卡类） |
| `UserAchievement` | userId+achievementId 唯一/expiresAt 限时卫冕/pinned≤5/featured 唯一展示/popped 弹层 | **直接复用**：闯关勋章的授予/佩戴/限时/弹层全套机制现成 |
| `User`（users） | email/username/passwordHash+pepper/role/status/avatarColor+avatarKey/bio/**dorm(宿舍楼，展示已暂缓)**/pwdVersion | **复用**；dorm 见弃用候选 |
| `StudentProfile` | eduEmail 唯一/school/college/major/grade/verifyStatus | **复用**：edu 认证结果沉淀 |
| `CreatorProfile` | bio/direction/honor/verified + 挂 Wallet/Income/Payout | **改造**：经济挂靠部分弃用；"direction（方向）"字段与成长方向导航天然契合，可升级为用户成长方向档案 |
| `Work`（works） | 完整资料体系：fileType/fileKey/previewKey/previewToc Json/category 7 类/isFree/price/rating+ratingDist Json/计数冗余/quality | **降级保留**：作为辅助资料区继续服务；VIP 付费语义若复活可复用 price/isFree |
| `Comment` | workId/roadmapId 二选一、parentId 一级、**V12 审核状态机**（VISIBLE/PENDING_REVIEW/REJECTED + modReason/modSource/reviewedAt） | **改造复用**：VIP 项目组社区讨论可直接挂（需再扩 targetType，如 groupId/projectId） |
| `Order`/`Download` | 支付订单/下载权限（unique workId+userId） | Order **弃用候选**；Download 复用（资料下载权限） |
| `Wallet`/`CreatorIncome`/`Payout` | 创作者钱包/T+7 结算/提现 | **弃用候选**（VIP 若收费可改造复活） |
| `Follow`/`Favorite`/`Like`/`Dynamic` | 社交三件套 + 动态流(PUBLISH/UPDATE/CHECKIN) | **复用**；DynamicType.CHECKIN 已存在，闯关动态可沿用 |
| `Notification` | type(9 枚举含 V12 评论 3 类)/text(白名单 sanitize)/link/read + `[userId,read,createdAt]` 索引 | **直接复用**：Agent 生成完成/验收结果/项目组动态只需加 NotificationType 枚举值 |
| `Report`/`AuditLog` | 举报带内容快照+处置联动；审核留痕 | **直接复用**（无备案平台的治理底线，转型后更重要） |
| `Announcement`/`AnnouncementRead` | 公告弹窗+已读 | **复用**：转型公告/科普内容发布可借形 |
| `Tag`/`WorkTag`/`WorkRating`/`RatingTag`/`WorkRatingTag` | 标签池/评分体系 | 评分体系随资料降级**低优先保留**；Tag 模式可参考 |

## 二、路线图实现（与"Agent 定制路线"的差距）

**关键代码：**
- 解析器：`src/lib/roadmap/parse.ts` — 前后端共享零依赖纯函数。格式约定：`## 标题`→阶段、阶段下段落→desc、`- [ ]`→步骤、缩进行→note；`stepId = p{phaseIdx}-s{stepIdx}` 发布后不可变（RoadmapCheck 引用）；`validateRoadmap` 门槛：≥1 阶段、≥3 步骤、无空阶段
- 服务：`src/server/services/roadmap.service.ts`（481 行）— 能力全清单：list（60s 缓存）/get（PUBLISHED 公共部分 300s 缓存+myFav 叠加）/create（ADMIN 直发、普通用户 PENDING+学生证+经历，服务端从 MinIO 拉 md 重新解析防伪造）/setFavorite 幂等/**toggleCheck**（限流 60/min、stepId 校验、同事务 upsert RoadmapCheck+DailyCheckin、返回 streakDays 供 toast）/**checkinStats**（streak 取账本今日/昨日行、byDay 365 天聚合、账本日兜底≥1）/progress/myFavorites/adminPending+adminGet+adminAudit（审核通知）
- 日期口径：`src/lib/day.ts` `dayCn8()` — UTC+8 日界，服务端与前端乐观更新共用（"改一处改两处"）
- 前端：`src/app/(site)/roadmaps/[id]/page.tsx`（阶段渲染+checkbox 勾选+侧栏进度条/连续天数/热力图/月历+评论区+配套资料）；列表 `roadmaps/page.tsx`、上传 `roadmaps/upload/page.tsx`、打卡榜 `roadmaps/rank/page.tsx`
- 组件：`src/components/roadmap/`（RoadmapCard / Heatmap：7×26 纯 CSS 网格 5 档橙阶 / CheckinCalendar / StepRichText）
- Hooks：`src/hooks/useRoadmaps.ts` — check 勾选乐观更新（本地 dayCn8 聚合，与服务端一致）

**差距清单（现有 → 目标"Agent 生成结构化定制路线"）：**
1. **共享 vs 私有**：现有 = 一份上传的公共路线，所有用户勾同一套步骤；目标 = 每用户一条 Agent 定制实例 → 需新表（userRoadmap / roadmapInstance），Roadmap 退化为模板库
2. **步骤模型太薄**：`{id,text,note?}` 无资源链接（现有只有路线级 RoadmapWorkLink）、无验收标准、无预计时长、无难度/依赖顺序 → content Json 需扩 schema（或转正式表结构）
3. **无闯关语义**：勾选完全自由，无"完成上一阶段才能解锁下一阶段"、无阶段门（验收）→ 需新增阶段验收实体与解锁逻辑；RoadmapCheck 可作为底层账本保留
4. **无生成链路**：现为人工 md 上传→审核；目标为 Agent 对话式生成 → 需新建生成管线（可搭现有 worker，见第四节）
5. **不可变约束**：stepId 与 content 结构绑定、V1 起无编辑功能 → 定制路线必然要"可再生成/可调整"，需新的版本化设计（旧约束只对公共模板保留）
6. **无科普内容位**：summary 仅 500 字，无阶段级讲解/科普正文

## 三、成就引擎（闯关体系能复用多少）

**关键代码：** `src/lib/achievements.ts`（字典单一事实源，seed 直接 import）+ `src/server/services/achievement.service.ts`（309 行）+ 组件 `src/components/medal/`（Medal 142 行：稀有度底座金属与光效、symbols.ts 为 game-icons.net CC BY 3.0 剪影库、HonorWall/PinnedBadges/BadgeInline/AchievementUnlockGate 礼花弹层）+ Hooks `src/hooks/useAchievements.ts`

- 字典：17 成就 = 帮助轴 6 阶（微光→万人传灯，10~10000 下载）、点赞 3 阶、收藏 2 阶、作品 2 阶、首个五星、周榜/月榜限时、学院之光（人工）、第一桶金
- 阈值：`THRESHOLD_LADDER`（metric→档位），`checkCount` 一次事件全阶梯尝试授予、幂等只发新解锁
- 授予链路（fire-and-forget）：`work.service` 上架→checkWorks、`social.service` 藏/赞→checkFavs/checkLikes、`order.service` 下载→checkHelp（queueMicrotask 不阻塞主流程）；限时榜由 worker cron（周一/每月）grantLeaderboard 授予+卫冕续期
- 佩戴体系：pinned≤5、featured 唯一展示位、inlineBadges 批量挂评论/卡片/榜单、过期自动隐藏数据保留

**复用评估：引擎层 ~90% 可复用，内容层 ~20%。** 授予幂等/限时卫冕/通知弹层/佩戴展示/六阶稀有度视觉全套直接继承闯关勋章体系；但 ① AchievementKey 是 Prisma 枚举，新增"阶段通关/路线毕业/连续打卡 N 天"（注意：现字典没有打卡类成就，这是现成空白）需迁移；② 触发点需从"下载/赞/藏"换成"验收通过/关卡完成"——在验收通过处调用 grant() 即可，模式完全一致。

## 四、AI 管线现状（Agent 服务能否搭在 worker 上）

**现状：AI 仅用于评论审核，但管线骨架是通用的。**
- DeepSeek 客户端：`src/server/moderation/ai.ts` — 零依赖 fetch、deepseek-chat、response_format: json_object、15s 超时、temperature 0、≈¥0.001/次、国内外直连；**故障哲学 = 抛错重试→耗尽 fail-closed 转人工，绝不无审核放行**；生产缺 DEEPSEEK_API_KEY 由 env.ts assertProdEnv 拦启动
- 敏感词：`src/server/moderation/words.ts` + words.data.ts（1192 行，Trie 匹配；NFKC 全角归一/去零宽/lowercase/打包去干扰符四层变体对抗；REJECT 硬拒 REVIEW 转人工两级），词源 scripts/build-words.ts 编译 dict/*.txt（fwwdn/sensitive-stop-words Apache-2.0 四分类 1169 词 + 校园专项代考代写/刷单）
- 评论管线：`src/server/services/comment.service.ts` — 限流 6/10min → 黑名单同步毫秒级 → 含 URL 一律暂审 → 灌水去重 409 → 入库 → enqueue('comment-moderate')（3 次指数退避 5s/10s/20s）
- Worker：`src/server/jobs/queue.ts`（共享 BullMQ 队列 campus-jobs，Redis 连接 maxRetriesPerRequest=null，enqueue() 供 API 进程 on-demand 投递）+ scheduler.ts（8 个 cron + on-demand case comment-moderate；failed 钩子 fail-close）

**结论：Agent 服务可以也建议直接搭在这个 worker 上。** 证明点：① API enqueue → worker case 消费 → service 调 LLM → 通知落库 的异步链路已在生产验证；② 重试+退避+fail-closed 的可靠性模式正是 Agent 生成所需；③ ai.ts 的 fetch+JSON+超时模板可复制为 Agent 客户端起点。需补：长任务形态（生成一条路线是分钟级多轮调用，要流式/进度上报/超时调大）、任务幂等与进度持久化（BullMQ job data 或新表）、以及 DeepSeek 之外的模型抽象层（现客户端写死单用途 prompt）。

## 五、认证 / 权限 / 通知 / 审核（哪些直接继承）

| 能力 | 关键代码 | 处置 |
|---|---|---|
| edu 邮箱认证 | `src/server/auth/verify-code.ts`：EDU_EMAIL_REGEX 放行 szu.edu.cn 任意子域 + szdx.wecom.work（2024 级企微邮箱）；Redis 6 位码 TTL 10min、register/reset purpose 隔离、错码不删 key 防爆破 | **直接继承**（VIP 项目组身份门槛可直接复用"已 edu 认证"判定） |
| 注册落档 | auth.service.ts register：验证码消费→建 User+StudentProfile（verifyStatus=VERIFIED） | **直接继承** |
| JWT 会话 | `src/server/auth/session.ts`：jose HS256、7 天、httpOnly cookie cm_token、**pwdVer claim 与库 pwdVersion 比对踢线**、封号检查 30s Redis 缓存、角色以库为准（提权≤30s 生效） | **直接继承** |
| 密码 | password.ts（pepper 追加；@node-rs/bcrypt 原生 + bcryptjs 兜底双依赖） | **直接继承** |
| RBAC | rbac.ts + Role(STUDENT/CREATOR/ADMIN) + ensurePublisher（登录即可发布） | **继承并扩展**：VIP 会员需新角色/资格维度（建议独立 VIP 状态而非塞 Role） |
| 路由中间件 | middleware.ts：公开路由白名单，其余无 cookie 401 | **直接继承**（新增 Agent/项目组路由按白名单模式补） |
| 通知系统 | notify.service.ts：text 落库前白名单 sanitize（b/strong/i/em/br）、未读红点即时失效缓存、粉丝 fan-out createMany；cron 90 天清理 | **直接继承**，仅加 NotificationType 枚举值 |
| 举报闭环 | report.service.ts（340 行）：内容快照、重复举报聚合、处置联动下架/封号、AuditLog 留痕 | **直接继承**（无备案平台底线资产，社区化后更重要） |
| 内容审核 | Comment 状态机 + 词库 + AI 复审 + 管理端队列 | **继承**：项目组发言审核复用整条管线 |

## 六、前端组件资产（新首页 vs 旧首页）

**设计 token：** `src/styles/globals.css`（9094 行单文件，全站唯一样式源）:root 令牌——品牌橙 `--pri:#ff6b4a` / `--pri-600:#ed4e2d` / `--pri-700:#d04a2a` / `--pri-50:#fff1ec`；薄荷 `--mint:#10b981`；精品红 `--fine:#d04a2a`；ink 四级墨色阶；圆角 4-10px；三档阴影；字体 Plus Jakarta Sans + Noto Sans SC；`--maxw: min(1520px, calc(100vw - 48px))`。**整体继承**，新首页直接吃这套 token 保品牌连续性。

**V10 博客组件：**
- `Masthead.tsx`：刊头（kicker + 大标题 + tagline + 分隔线 + 分类 chips 行）——**新首页"方向导航"刊头的现成骨架**，改文案与 chip 数据源即可
- `FeedRow.tsx`（115 行）：目录式列表行，feed（日期左列）/rec（emoji 左列）双 variant，眉题+标题+摘要+meta——**科普文章流可直接复用**
- `LatestFeed`/`EditorPicks`/`RoadmapsZone`/`SideColumn`/`FreshmanZone`：首页分区组件——分区模式复用，内容重写
- `WorkPreviewInline.tsx`（V11）：内嵌预览（MD 前 30% 展开/PDF iframe/观看计数去重）——随资料区保留
- 手机端：MobileNav.tsx 底部 5-tab（首页/搜索/发布/动态/我的，线上已验证）——**直接继承**，最多换"发布"为"我的路线"
- 通用件：Modal/Toast/Tabs/Stars/Stepper/Tag/Empty/StatCard/UserAvatar + zustand stores/ui.ts + React Query hooks 全家桶——全部继承
- 分类字典：`src/lib/constants.ts` CATEGORIES（新生引路/课程学习/升学备考/留学申请/求职实习/成长视野/家教教案，带 icon+desc）——**这就是现成的"成长方向"taxonomy 种子**

**新旧首页关系：** 现首页 = Masthead → 关注动态 → 双区 tab → blog-layout 主列+侧栏。新首页（方向导航+科普）可保留骨架换内容：双区 tab 改为"方向导航/我的成长"，主列换方向卡+科普 FeedRow，侧栏保留榜单/公告。旧资料流下沉到 /explore 不动。

## 七、docs/ 文档地图（一句话摘要）

| 文档 | 摘要 |
|---|---|
| `PRODUCT.md`（根目录） | 产品 register：深大本科生+创作者双人群、kedahub.cn 定位、品牌人格"靠谱学长"、5 条设计原则与 a11y 标准——**转型后需重写但格式可继承** |
| `docs/API_CONTRACT.md` | API 唯一事实源：/api/v1 前缀、JWT cookie、错误格式、分页/幂等/金额字符串约定 |
| `docs/BACKEND.md` | 后端执行规范：技术栈锁定、目录结构、核心飞轮、生产级验收清单 |
| `docs/FRONTEND.md` | 前端执行规范：原型一一对照原则、禁 UI 组件库、视觉 token 清单（橙 #FF6B4A 等） |
| `docs/VERSION2.md` ~ `VERSION3.md` | V2 生产化 / V3 产品形态（开放发布、7 分类、封面、预览、举报闭环） |
| `docs/PLAN_V11.md` / `PLAN_V12.md` | V11"读得顺" / V12 评论+AI审核+打卡账本+打卡榜（**转型前最后一份"当前态"文档，最重要**） |
| `docs/FRONTEND_V10_BLOG_REDESIGN.md` | V10 博客化改版：卡片网格→刊头+目录式列表，旧功能→新组件映射表 |
| `docs/PERFORMANCE.md` | 压测报告：单进程 125 RPS 封顶→3 副本 415 RPS |
| `docs/DEPLOY.md` | 部署手册：docker compose、生产 compose（Caddy+app×3+worker+PgBouncer）、env 清单 |
| `docs/PROGRESS.md` | V0→V12.2 每阶段"做了什么/问题/反思"，考古价值最高 |

## 八、技术栈版本清单（package.json）

| 依赖 | 版本 | 备注 |
|---|---|---|
| next | ~14.2.5 | App Router，standalone 输出 |
| react / react-dom | ^18.3.1 | |
| prisma / @prisma/client | ~5.18.0 | PostgreSQL |
| typescript | ~5.4.5 | |
| zod | ^3.23.8 | 契约校验 |
| @tanstack/react-query | ^5.51.11 | 全站数据层 |
| zustand | ^4.5.4 | UI store |
| jose | ^5.9.6 | JWT |
| @node-rs/bcrypt / bcryptjs | 双份 | 密码 |
| bullmq / ioredis | ^5.12.12 / ^5.4.1 | 队列 |
| minio + @aws-sdk/client-s3 | 桶：works/avatars/covers/previews/roadmaps/credentials | 对象存储 |
| nodemailer | edu 验证码邮件（生产已切 Resend HTTP API） |
| marked / dompurify / sanitize-html | 渲染与 XSS |
| pdf-lib / pdfjs-dist | PDF 试读副本生成/预览 |
| pino / pino-http / @sentry/nextjs | 日志与监控 |
| 测试 | vitest ^1.6 + playwright ^1.46 + msw ^2.3（219+ 测试全绿） |

运行时：Node 20/24、pnpm 10、双进程 `pnpm dev` + `pnpm worker`。

## 九、弃用候选（转型后大概率不用）

| 资产 | 说明 |
|---|---|
| 支付链路（代码在、开关 off） | src/server/payment/、order.service.ts（370 行）、epay webhook、OrderModal、/pay/result——V7 起 PAYMENT_MODE=off 全站免费；若 VIP 项目组收费可改造复活（订单/幂等/回调骨架仍在），否则整体冻结 |
| 收益/提现 | income.service.ts、/income、Wallet/CreatorIncome/Payout 三表、income-settle cron——随支付一并冻结 |
| 作品转移 | admin.service.ts#transferWorks——资料署名转移，转型后低频 |
| 宿舍楼字段 | users.dorm + DORM_OPTIONS——git e540b27 已暂缓，建议顺势弃用，社区巧思由 VIP 项目组承接 |
| 创作者认证审核 | verified 仅剩徽章展示 |
| 质量自动升降级 | quality.service.ts——随资料区降级变低频，可保留 |

## 十、转型的技术连续性总评

**地基（直接继承，约占现有资产 60-65%）：**
1. **账号与信任层**——edu 邮箱认证、JWT+pwdVersion 踢线、RBAC、限流、封号缓存：一行不用改
2. **异步任务与 AI 接入骨架**——BullMQ 共享队列 + on-demand enqueue + 重试退避 + fail-closed 哲学 + DeepSeek 客户端模板：Agent 生成服务的新 case 即可挂上
3. **打卡账本引擎**——RoadmapCheck/DailyCheckin/dayCn8/热力图/连续天数/打卡榜：闯关式推进的进度底座
4. **成就引擎**——授予幂等/限时卫冕/佩戴/弹层/六阶稀有度视觉：闯关勋章换字典即用
5. **治理三件套**——敏感词 Trie + AI 复核 + 举报闭环
6. **设计系统与部署基建**——token 体系/移动 tabbar/通用组件 + docker compose 三副本/Caddy/PgBouncer

**需新建（约占 35-40%）：**
1. **Agent 路线生成管线**——多轮 LLM 调用、长任务进度上报、生成结果校验
2. **定制路线数据模型**——per-user 实例表、富步骤 schema、阶段验收实体与解锁门
3. **阶段验收流程**——提交→评审→通过解锁（通知/成就/打卡触发点都有现成挂点）
4. **VIP 项目组社区**——组/成员/申请/组内内容：全新表与页面
5. **新首页方向导航+科普**——骨架复用，信息架构重写；CATEGORIES 是现成方向 taxonomy 种子

**一句话：这是一次"换心脏不换骨架"的转型——账号、队列、账本、成就、治理、设计系统六块地基全保留；要新建的全部围绕"Agent 生成 + 验收门 + 项目组"三个新领域概念。**
