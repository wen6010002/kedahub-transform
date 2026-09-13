# 课搭 2.0 转型 · 长程任务进度看板

启动：2026-09-13。状态：**设计阶段完成（P0–P3 全部交付），待用户评审拍板**。

## 阶段规划

- [x] P0 环境准备：基线克隆 ~/campus-market-baseline（V12.2 d89f3a8）
- [x] P0 新仓库 wen6010002/kedahub-next（private，待用户确认是否公开）
- [x] P0 产品愿景骨架 docs/00-VISION.md
- [x] P1 四路调研（全部完成）
  - [x] research/agent-tech.md —— 结论：无需多 Agent 框架；Vercel AI SDK generateObject + Zod；模板+patch 架构；Spring AI Alibaba 承载验收；月成本 ¥200
  - [x] research/interaction-design.md —— 结论：交互语言「山径·印记」三层体系；路线即连胜；三档仪式
  - [x] research/community-cohort.md —— 结论：月度滚动项目组；四层验收漏斗；定价 399-499/199 内测；合规红线
  - [x] research/baseline-assets.md —— 结论：1.0 可复用率 60-65%；六大地基
- [x] P2 HTML 高保真原型（prototype/ 共 10 页 + 共享设计系统）
  - [x] index.html 封面导览 · 01 首页 · 02 方向指南 · 03 问卷 · 04 生成仪式 · 05 我的路线（灵魂页，动态山径+验收仪式演示）· 06 节点详情 · 07 资料馆 · 08 项目组 · 09 定价
  - [x] 视觉验证：playwright 截图（首页/灵魂页桌面+移动/项目组星图）确认渲染正确
- [x] P3 产品设计文档
  - [x] docs/DESIGN.md（产品定位/商业模式/IA/页面规格/Agent 架构/数据模型/API/技术选型/路线图/运营/风险）
  - [x] docs/DESIGN-PART2.md（交互语言「山径·印记」定稿 + 闯关激励系统 + 动效规格）
- [x] P4 推送 GitHub kedahub-next（待执行 git push）

## 用户已定稿的关键决策

1. 服务器 154.222.19.224 未经允许不动（本次全程未动）
2. 路线绝不能纯文字：有闯关属性（解锁/验收/打卡）但**不游戏化**；交互语言最终定稿 =「山径·印记」（等高线山径 + 护照印章 + 排印纪律）
3. 首页依旧是资料分享 + 各种方向详细介绍 + 认真科普（落地为方向导航 + 资料馆降位）
4. VIP 项目组：同类别进一个项目组，验收/辅导/交流（落地为月度滚动编组 + 四层验收 + 星图）
5. 商业逻辑：免费给真价值（路线+前两阶段），付费买结果服务（验收/社群/陪跑）

## 待用户拍板清单（DESIGN.md §13.2 有完整版）

1. 免费层是否给一次真实验收体验（倾向：给）
2. 项目组定价 449 正式 / 199 内测
3. 转型代码分支策略（倾向：原仓库 transform/v2 分支）
4. 支付通道（复活 epay 骨架 vs 官方支付 vs 先线下）
5. 新仓库 kedahub-next 是否公开
6. 免费阶段边界最终定稿（前 2 阶段 + 14 天走完阶段一）

## 仓库布局备忘

- ~/kedahub-transform/ = 本转型文件夹（docs + prototype + research + PROGRESS.md），推 kedahub-next
- ~/campus-market-baseline/ = 1.0 基线只读参考
