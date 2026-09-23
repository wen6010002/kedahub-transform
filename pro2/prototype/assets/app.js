/* 课搭 2.0 原型 · 共享底座（2026-09-20 全局改版版）
   全站共用五件事：
   1. 统一导航注入（首页 / 闯关路线 / 项目训练营 / 资料库 + 铃铛 + 头像下拉）
   2. 全站内页面包屑注入
   3. 状态层 KH：登录态、会员态、XP、关卡进度，写 localStorage
   4. 横向蜿蜒闯关地图渲染器 renderMap（免费路线与会员专属路线复用同一套）
   5. 会员升级弹窗 / toast / 演示开关
   页面自己的交互写在各自的 <script> 里。
*/
(function () {
  'use strict';

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ══════════ 1. 出场动画 ══════════ */
  function bindReveal() {
    var targets = document.querySelectorAll('.reveal, .rv');
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ══════════ 2. 静态数据：路线与站点 ══════════ */
  /* 站点名全部来自 materials/ 的真实文件名 */
  var ROUTES = [
    {
      id: 'm1', ico: '🖥️', name: '计算机初识', main: true,
      desc: '把每天在用的这台机器拆开看一遍：它怎么存东西、怎么算东西、为什么卡。',
      stations: ['电脑是怎么工作的', '二进制与编码', '文件与目录', '常见文件格式', '黑窗口', 'Shell', '脚本', '软件是怎么装上去的', 'Git']
    },
    {
      id: 'm2', ico: '🌐', name: '前后端初识', main: true,
      desc: '从地址栏回车到页面出现，中间发生了什么。前端、后端、数据库各占哪一段。',
      stations: ['一个网页是怎么出现的', '前端技术栈', '前端不依赖后端能做什么', '后端都包括什么', '服务器', '网络初识', '数据库', '各种数据库', '接口', '部署上线', '云服务']
    },
    {
      id: 'm3', ico: '🤖', name: 'AI 初识', main: true,
      desc: 'AI、机器学习、深度学习、大模型是什么关系。不写公式，先建立正确的直觉。',
      stations: ['AI·机器学习·深度学习·大模型', '模型是什么', '训练是怎么回事', '提示词', '幻觉', '微调', 'RAG', 'Agent', '多模态', '最前沿的模型与 Agent']
    },
    {
      id: 'm4', ico: '📐', name: '产品初识', main: false,
      desc: '看看产品经理每天在干什么，一个需求从提出到上线要经过谁的手。',
      stations: ['一个产品是怎么做出来的', '产品经理一天在干什么', '以前的产品在干什么', 'AI 产品', '怎么判断需求值不值得做']
    },
    {
      id: 'm5', ico: '🛠️', name: '测试与运维初识', main: false,
      desc: '代码写完之后的世界：怎么保证它不坏，坏的时候谁先知道。',
      stations: ['测试', '运维', '监控与告警']
    },
    {
      id: 'm6', ico: '📊', name: '算法工程师初识', main: false,
      desc: '算法工程师到底在做什么，数学在里面扮演什么角色，大一能准备什么。',
      stations: ['算法工程师到底在做什么', '数学在这里扮演什么角色', '大一现在能做什么准备']
    }
  ];

  /* 「更多闯关地图」：按方向切的专题小地图。
     和上面 6 张是平级关系 —— 用户自己挑，不走完哪张都不影响开哪张。 */
  var MORE_ROUTES = [
    {
      id: 'x1', ico: '🚀', name: 'AI 应用实战', more: true,
      desc: '把模型接进一个真能用的东西里：调接口、给它资料、让它自己跑完一段流程。',
      stations: ['接上第一个模型接口', '提示词到底怎么调', '给模型接上你的资料', '让模型会用工具', '把它部署出去', '复盘：这一路做对了什么']
    },
    {
      id: 'x2', ico: '🔐', name: 'Web 安全初识', more: true,
      desc: '站在攻的那一侧看一遍：常见漏洞长什么样，写代码的那一侧怎么躲开。',
      stations: ['一次合规的渗透测试', '注入类漏洞', '认证与会话', '前端这一侧的坑', '依赖与供应链', '写一份拿得出手的报告']
    },
    {
      id: 'x3', ico: '📈', name: '数据工程初识', more: true,
      desc: '数据从哪来、怎么洗干净、怎么变成别人看得懂的结论。',
      stations: ['数据从哪来', '清洗与对齐', '一份能看的报表', '指标到底怎么定', '管道与调度']
    },
    {
      id: 'x4', ico: '🎓', name: '考研 408 冲刺', more: true,
      desc: '四门课按考试的顺序重排一遍：先捡分高的，再啃难啃的。',
      stations: ['数据结构', '组成原理', '操作系统', '计算机网络', '真题怎么刷']
    },
    {
      id: 'x5', ico: '💼', name: '求职冲刺', more: true,
      desc: '从简历到面试，按时间倒着排：先知道人家要什么，再决定补什么。',
      stations: ['简历怎么写', '项目怎么讲', '八股怎么背', '模拟面试', 'offer 怎么选']
    }
  ];

  /* 会员专属进阶路线：复用同一套闯关地图 UI */
  var MEMBER_ROUTE = {
    id: 'vip', ico: '♛', name: '会员专属进阶路线', main: true, vip: true,
    desc: '免费路线带你进门，这条路线带你做出能被别人用起来的东西。每关一个可交付成果。',
    stages: [
      { name: '工程化地基', from: 1, to: 4 },
      { name: '真实项目', from: 5, to: 8 },
      { name: '进阶专项', from: 9, to: 12 }
    ],
    stations: [
      'Git 协作流程：分支、PR 与冲突',
      '代码审查：怎么读别人的代码',
      '单元测试：给代码上一道保险',
      'CI 流水线：提交之后自动跑一遍',
      '需求拆解：把一句话拆成任务清单',
      '接口设计：前后端怎么对齐',
      '数据建模：表该怎么拆',
      '性能优化：先量再改',
      'RAG 实战：给模型接上你的资料',
      'Agent 实战：让它自己跑完一段流程',
      '部署与监控：上线之后才是开始',
      '复盘报告：把这一路讲清楚'
    ]
  };

  /* 每个页面：active = 顶部导航高亮哪一项；crumb = 面包屑 */
  var PAGES = {
    '01-home.html': { active: '01-home.html', crumb: null },
    '02-routes.html': { active: '02-routes.html', crumb: ['首页', '闯关路线'] },
    '03-map.html': { active: '02-routes.html', crumb: ['首页', '闯关路线', '闯关地图'] },
    '04-node.html': { active: '02-routes.html', crumb: ['首页', '闯关路线', '单关卡'] },
    '05-direction.html': { active: null, crumb: ['首页', '方向科普'] },
    '06-survey.html': { active: null, crumb: ['首页', '路线引导'] },
    '07-generating.html': { active: null, crumb: ['首页', '生成路线'] },
    '08-roadmap.html': { active: '02-routes.html', crumb: ['首页', '闯关路线', '会员专属路线'] },
    '09-library.html': { active: '09-library.html', crumb: ['首页', '资料库'] },
    '10-cohort.html': { active: '10-cohort.html', crumb: ['首页', '项目训练营'] },
    '11-member.html': { active: null, crumb: ['首页', '会员中心'] },
    'index.html': { active: null, crumb: null }
  };

  /* 面包屑每一级对应的链接，最后一级不给链接 */
  var CRUMB_HREF = {
    '首页': '01-home.html',
    '闯关路线': '02-routes.html',
    '资料库': '09-library.html',
    '项目训练营': '10-cohort.html',
    '会员中心': '11-member.html'
  };

  var NAV_ITEMS = [
    { href: '01-home.html', label: '首页' },
    { href: '02-routes.html', label: '闯关路线' },
    { href: '10-cohort.html', label: '项目训练营' },
    { href: '09-library.html', label: '资料库' }
  ];

  /* ══════════ 3. 状态层 ══════════ */
  var KEY = {
    user: 'kh:user',        // { logged, name, initial }
    member: 'kh:member',    // { vip:bool, until:'2027-03-20', plan:'学年' }
    xp: 'kh:xp',            // number
    levels: 'kh:levels',    // { m1:[已完成站点序号...], vip:[...] }
    freeJump: 'kh:freeJump',// { m1:true } 自由解锁开关
    /* 兼容旧页（问卷 / 手感 / 提交记录） */
    survey: 'kh:survey', taste: 'kh:taste', progress: 'kh:progress', submissions: 'kh:submissions'
  };
  var mem = {};   // localStorage 不可用时的内存兜底（file:// 下也能在同一次会话里走通）

  var KH = {
    key: KEY,
    ROUTES: ROUTES,
    MORE_ROUTES: MORE_ROUTES,
    MEMBER_ROUTE: MEMBER_ROUTE,

    /* 6 张基础地图 + 「更多闯关地图」里的专题地图，一起算 */
    allRoutes: function () { return ROUTES.concat(MORE_ROUTES); },
    /* 按 id 找路线：基础地图找不到就去专题地图里找 */
    findRoute: function (id) {
      var all = ROUTES.concat(MORE_ROUTES);
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    },
    /* 闯关地图页链接 */
    mapUrl: function (id) { return '03-map.html?route=' + id; },

    get: function (name, fallback) {
      try {
        var raw = localStorage.getItem(KEY[name]);
        if (raw !== null) return JSON.parse(raw);
      } catch (e) { /* file:// 或隐私模式 */ }
      return Object.prototype.hasOwnProperty.call(mem, name) ? mem[name] : (fallback === undefined ? null : fallback);
    },
    set: function (name, value) {
      mem[name] = value;
      try { localStorage.setItem(KEY[name], JSON.stringify(value)); } catch (e) { /* 忽略 */ }
      return value;
    },
    patch: function (name, delta) {
      var cur = KH.get(name, {}) || {};
      Object.keys(delta || {}).forEach(function (k) { cur[k] = delta[k]; });
      return KH.set(name, cur);
    },

    /* —— 默认值 —— */
    user: function () { return KH.get('user', null) || { logged: true, name: '林小满', initial: '满' }; },
    isLogged: function () { return !!KH.user().logged; },
    member: function () { return KH.get('member', null) || { vip: false, until: '', plan: '' }; },
    isVip: function () { return !!KH.member().vip; },

    xp: function () {
      var v = KH.get('xp', null);
      if (v === null) { v = 320; KH.set('xp', v); }
      return v;
    },
    addXp: function (n) { var v = KH.xp() + n; KH.set('xp', v); return v; },
    /* 学习等级：每 200 XP 升一级 */
    level: function () { return Math.floor(KH.xp() / 200) + 1; },
    levelName: function () {
      var L = ['', '入门', '上手', '入门', '上手', '熟练', '熟练', '进阶', '进阶', '准专业'][KH.level()] || '准专业';
      return 'Lv.' + KH.level() + ' ' + L;
    },

    /* —— 关卡进度 —— */
    done: function (routeId) {
      var all = KH.get('levels', {}) || {};
      return all[routeId] || [];
    },
    isDone: function (routeId, n) { return KH.done(routeId).indexOf(n) >= 0; },
    /* 完成第 n 关（n 从 1 开始） */
    finish: function (routeId, n) {
      var all = KH.get('levels', {}) || {};
      var list = all[routeId] || [];
      if (list.indexOf(n) < 0) list.push(n);
      all[routeId] = list;
      KH.set('levels', all);
      return list;
    },
    reset: function (routeId) {
      var all = KH.get('levels', {}) || {};
      all[routeId] = [];
      KH.set('levels', all);
    },
    /* 只把某一关退回未通关（用于「再走一遍」），不影响其它关卡 */
    unfinish: function (routeId, n) {
      var all = KH.get('levels', {}) || {};
      var list = all[routeId] || [];
      all[routeId] = list.filter(function (x) { return x !== n; });
      KH.set('levels', all);
      return all[routeId];
    },
    /* 顺序解锁下的当前关：第一个未完成的 */
    current: function (routeId, total) {
      var list = KH.done(routeId);
      for (var i = 1; i <= total; i++) { if (list.indexOf(i) < 0) return i; }
      return total;
    },
    /* 整条路线是否已全部通关 */
    allDone: function (routeId, total) { return KH.done(routeId).length >= total; },
    /* 自由解锁开关：会员可开；普通用户整条通关后也可开 */
    jumpable: function (routeId, total) {
      var fj = KH.get('freeJump', {}) || {};
      return !!fj[routeId];
    },
    canJump: function (routeId, total) { return KH.isVip() || KH.allDone(routeId, total); },
    setJump: function (routeId, on) { return KH.patch('freeJump', (function () { var o = {}; o[routeId] = !!on; return o; })()); },

    /* 单关卡页链接 */
    nodeUrl: function (routeId, n) { return '04-node.html?route=' + routeId + '&n=' + n; },

    ago: function (iso) {
      if (!iso) return '';
      var d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
      if (isNaN(d)) return '';
      if (d <= 0) return '今天';
      if (d === 1) return '昨天';
      if (d < 30) return d + ' 天前';
      return Math.floor(d / 30) + ' 个月前';
    }
  };
  window.KH = KH;

  /* ══════════ 4. toast ══════════ */
  var toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }
  KH.toast = toast;

  /* ══════ 5b. 非侵入式会员提示（右下角小卡，绝不抢焦点、绝不自动弹窗） ══════
     规则：只有用户主动点了会员资料才出现；可以随手关掉；6 秒自动收起。
     与 KH.openVip（模态）分两用 —— 模态只在用户点了明确的「升级/开通」按钮时才用。 */
  var softEl = null, softT = null;
  function softVip(msg) {
    if (!softEl) {
      softEl = document.createElement('div');
      softEl.className = 'softup';
      softEl.setAttribute('role', 'status');
      softEl.innerHTML =
        '<div class="su-h">♛ <span>这一份是会员精点资料</span></div>' +
        '<div class="su-b"></div>' +
        '<div class="su-a">' +
        '<a class="btn btn-gold btn-sm" href="11-member.html">看看会员</a>' +
        '<button type="button" class="su-x">知道了</button>' +
        '</div>';
      softEl.querySelector('.su-x').addEventListener('click', function () { softVip.hide(); });
      document.body.appendChild(softEl);
    }
    softEl.querySelector('.su-b').innerHTML =
      msg || '基础资料永久免费，精点高阶资料由会员解锁。你不用现在决定 —— 免费资料照样能读。';
    softEl.classList.add('show');
    clearTimeout(softT);
    softT = setTimeout(function () { softEl.classList.remove('show'); }, 6000);
  }
  softVip.hide = function () {
    clearTimeout(softT);
    if (softEl) softEl.classList.remove('show');
  };
  KH.softVip = softVip;

  /* ══════════ 5. 会员升级弹窗（只在手动点击时出现） ══════════ */
  function ensureMemberDialog() {
    if (document.getElementById('khVipDlg')) return document.getElementById('khVipDlg');
    var d = document.createElement('dialog');
    d.id = 'khVipDlg';
    d.className = 'cele';
    d.innerHTML =
      '<div class="cele-in">' +
      '<span style="font-size:44px;line-height:1;display:block">♛</span>' +
      '<h3>本路线为会员专属内容</h3>' +
      '<p>升级会员即可解锁全部专属闯关路线、自由解锁关卡特权。<br>基础路线永久免费，不受影响。</p>' +
      '</div>' +
      '<div class="cele-acts">' +
      '<a class="btn btn-outline" href="02-routes.html">看免费路线</a>' +
      '<a class="btn btn-gold" href="11-member.html">去会员中心</a>' +
      '</div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    return d;
  }
  KH.openVip = function () { ensureMemberDialog().showModal(); };

  /* ══════════ 6. 导航注入 ══════════ */
  var LOGO_SVG =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';

  function navHtml(active) {
    var u = KH.user(), vip = KH.isVip(), logged = KH.isLogged();
    var links = NAV_ITEMS.map(function (it) {
      var on = (it.href === active) ? ' on' : '';
      return '<a class="nav-link' + on + '" href="' + it.href + '">' + it.label + '</a>';
    }).join('');

    var right;
    if (logged) {
      right =
        '<div class="bell">' +
        '<button class="bell-btn" id="khBell" type="button" aria-label="通知">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>' +
        '<span class="bell-dot"></span></button></div>' +
        '<div class="avatar">' +
        '<button class="avatar-btn' + (vip ? ' is-member' : '') + '" id="khAvatar" type="button" aria-label="我的菜单" aria-expanded="false">' +
        (u.initial || u.name.slice(0, 1)) + '</button>' +
        '<div class="menu" id="khMenu" role="menu">' +
        '<div class="menu-h"><b>' + u.name + '</b>' +
        '<span>' + KH.levelName() + ' · ' + KH.xp() + ' XP' +
        (vip ? ' · <span class="mh-vip">会员</span>' : '') + '</span></div>' +
        '<a href="02-routes.html" role="menuitem"><span class="m-ico">🎯</span>我的闯关</a>' +
        '<a href="10-cohort.html" role="menuitem"><span class="m-ico">🧑‍🤝‍🧑</span>我的项目</a>' +
        '<a href="09-library.html?fav=1" role="menuitem"><span class="m-ico">⭐</span>我的收藏</a>' +
        '<a href="06-survey.html" role="menuitem"><span class="m-ico">🧭</span>路线引导问卷</a>' +
        '<div class="menu-sep"></div>' +
        '<a href="11-member.html" role="menuitem"><span class="m-ico">♛</span>会员中心' +
        (vip ? '<span class="m-tag">已开通</span>' : '') + '</a>' +
        '<a href="#" role="menuitem"><span class="m-ico">⚙️</span>设置</a>' +
        '<div class="menu-sep"></div>' +
        '<button type="button" class="m-out" id="khLogout"><span class="m-ico">↩</span>退出登录</button>' +
        '</div></div>';
    } else {
      right =
        '<a class="btn btn-outline btn-sm" href="06-survey.html">登录</a>' +
        '<a class="btn btn-primary btn-sm" href="06-survey.html">开始探索</a>';
    }

    return '<nav class="nav"><div class="nav-inner">' +
      '<a class="logo" href="01-home.html"><span class="logo-mark">' + LOGO_SVG + '</span>' +
      '<span class="logo-text"><b>课搭</b><span>大学生成长社区</span></span></a>' +
      '<div class="nav-search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>搜索资料、路线、学长经验…</div>' +
      '<div class="nav-actions">' + links + right + '</div>' +
      '</div></nav>';
  }

  function bindMenu() {
    var btn = document.getElementById('khAvatar');
    var menu = document.getElementById('khMenu');
    var bell = document.getElementById('khBell');
    if (!btn || !menu) return;
    function close() { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a,button')) close(); });

    if (bell) bell.addEventListener('click', function () { toast('3 条新通知 · 项目训练营有新答辩安排'); });
    var out = document.getElementById('khLogout');
    if (out) out.addEventListener('click', function () {
      KH.set('user', { logged: false, name: '', initial: '' });
      location.reload();
    });
  }

  /* ══════════ 7. 面包屑注入 ══════════ */
  function crumbHtml(list) {
    if (!list || !list.length) return '';
    var parts = list.map(function (t, i) {
      var last = i === list.length - 1;
      var href = CRUMB_HREF[t];
      if (last || !href) return '<span class="cb-now">' + t + '</span>';
      return '<a href="' + href + '">' + t + '</a>';
    });
    return '<nav class="crumb" aria-label="面包屑">' + parts.join('<span class="cb-sep">›</span>') + '</nav>';
  }

  /* ══════════ 8. 演示开关（原型评审用） ══════════ */
  function renderDemoBar() {
    if (document.getElementById('khDemo')) return;
    var bar = document.createElement('div');
    bar.className = 'demobar';
    bar.id = 'khDemo';
    bar.innerHTML = '<span class="db-l">演示</span>' +
      '<button type="button" id="dbLogin"></button>' +
      '<button type="button" id="dbVip"></button>';
    document.body.appendChild(bar);

    function sync() {
      var lb = document.getElementById('dbLogin'), vb = document.getElementById('dbVip');
      lb.textContent = KH.isLogged() ? '已登录' : '未登录';
      lb.className = KH.isLogged() ? 'on' : '';
      vb.textContent = KH.isVip() ? '会员' : '非会员';
      vb.className = KH.isVip() ? 'on' : '';
    }
    sync();
    document.getElementById('dbLogin').addEventListener('click', function () {
      KH.set('user', KH.isLogged()
        ? { logged: false, name: '', initial: '' }
        : { logged: true, name: '林小满', initial: '满' });
      location.reload();
    });
    document.getElementById('dbVip').addEventListener('click', function () {
      var vip = !KH.isVip();
      KH.set('member', vip
        ? { vip: true, until: '2027-03-20', plan: '学年' }
        : { vip: false, until: '', plan: '' });
      location.reload();
    });
  }

  /* ══════════ 9. 闯关地图渲染 ══════════
     opts: { route:{id,name,stations}, el, step }
     — 节点状态：已通关打勾 / 未解锁灰锁 / 当前可挑战高亮
     — 普通用户顺序解锁；会员（或整条通关后）可开自由解锁
  */
  var MAP_STEP = 138, MAP_W = 96;

  function mapPoint(i) {
    return {
      x: MAP_W + i * MAP_STEP,
      y: 148 + Math.sin(i * 0.72 + 0.5) * 74
    };
  }

  function renderMap(opts) {
    var host = typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el;
    if (!host) return null;
    var route = opts.route;
    var total = route.stations.length;
    var done = KH.done(route.id);
    var cur = KH.current(route.id, total);
    var free = KH.jumpable(route.id) && KH.canJump(route.id, total);
    var width = MAP_W * 2 + (total - 1) * MAP_STEP;

    var pts = [];
    for (var i = 0; i < total; i++) pts.push(mapPoint(i));

    /* 路径：水平控制点的三次贝塞尔，形成蜿蜒感 */
    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var j = 1; j < total; j++) {
      var a = pts[j - 1], b = pts[j], dx = (b.x - a.x) * 0.5;
      d += ' C ' + (a.x + dx) + ' ' + a.y + ' ' + (b.x - dx) + ' ' + b.y + ' ' + b.x + ' ' + b.y;
    }

    var nodes = '';
    for (var k = 0; k < total; k++) {
      var n = k + 1;
      var isDone = done.indexOf(n) >= 0;
      var isNow = !isDone && n === cur;
      var isLock = !isDone && n > cur && !free;
      var cls = isDone ? 'done' : (isNow ? 'now mn-halo' : (isLock ? 'lock' : 'now'));
      var face = isDone ? '✓' : (isLock ? '🔒' : n);
      var p = pts[k];
      var title = route.stations[k];
      nodes +=
        '<a class="mn ' + cls + '" style="left:' + p.x + 'px;top:' + p.y + 'px" ' +
        'href="' + (isLock ? 'javascript:void(0)' : KH.nodeUrl(route.id, n)) + '" ' +
        'data-n="' + n + '" data-lock="' + (isLock ? 1 : 0) + '" ' +
        'title="' + title + '" aria-label="第 ' + n + ' 关 ' + title + '">' +
        face + '<span class="mn-cap">' + title + '</span></a>';
    }

    host.innerHTML =
      '<div class="map-shell">' +
      '<div class="map-head">' +
      '<div><div class="mh-t">' + route.name + ' · 闯关地图</div>' +
      '<div class="mh-s">共 ' + total + ' 关 · 已通关 ' + done.length + ' 关' +
      (free ? ' · <b style="color:var(--gold-600)">自由解锁已开启</b>' : ' · 顺序解锁') + '</div></div>' +
      '<div class="mh-r">' +
      '<label class="sw' + (KH.canJump(route.id, total) ? '' : ' sw-off') + '" title="' +
      (KH.canJump(route.id, total) ? '' : '会员可用；普通用户把整条路线走完也会开放') + '">' +
      '<input type="checkbox" id="khJump" ' + (free ? 'checked' : '') + ' ' +
      (KH.canJump(route.id, total) ? '' : 'disabled') + '>' +
      '<span class="sw-track"></span>自由解锁' + (KH.isVip() ? '（会员）' : '') + '</label>' +
      '<a class="btn btn-light btn-sm" href="02-routes.html">换一条路线</a>' +
      '</div></div>' +
      '<div class="map-scroll" id="khMapScroll"><div class="map-inner" style="width:' + width + 'px">' +
      '<svg class="map-svg" width="' + width + '" height="330" viewBox="0 0 ' + width + ' 330">' +
      '<path class="mp-track" d="' + d + '"/><path class="mp-done" id="khMapDone" d="' + d + '"/></svg>' +
      nodes + '</div></div>' +
      '<div class="map-foot">' +
      '<span class="map-legend"><i class="lg-done"></i>已通关</span>' +
      '<span class="map-legend"><i class="lg-now"></i>当前可挑战</span>' +
      '<span class="map-legend"><i class="lg-lock"></i>未解锁</span>' +
      '<span style="margin-left:auto">' + (KH.canJump(route.id, total)
        ? '自由解锁可用：可以直接跳到任意一关'
        : '完成当前关才能解锁下一关 · 会员可开启自由解锁') + '</span>' +
      '</div></div>';

    /* 路径进度 */
    var box = host.querySelector('#khMapScroll');
    var path = host.querySelector('#khMapDone');
    if (path && path.getTotalLength) {
      var len = path.getTotalLength();
      var ratio = total > 1 ? Math.min(1, Math.max(0, (cur - 1) / (total - 1))) : 1;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len * (1 - ratio);
      if (done.length >= total) path.style.strokeDashoffset = 0;
    }

    /* 锁定节点点击提示 */
    host.querySelectorAll('.mn[data-lock="1"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        toast('先完成第 ' + (KH.current(route.id, total)) + ' 关，才能解锁这一关');
      });
    });

    /* 自由解锁开关 */
    var jump = host.querySelector('#khJump');
    if (jump) jump.addEventListener('change', function () {
      KH.setJump(route.id, jump.checked);
      renderMap(opts);
    });

    /* 滚到当前关 */
    if (box) {
      var allDone = host.querySelectorAll('.mn.done');
      var target = host.querySelector('.mn.now') || (allDone.length ? allDone[allDone.length - 1] : null);
      if (target) {
        var x = parseFloat(target.style.left) - box.clientWidth / 2;
        box.scrollLeft = Math.max(0, x);
      }
    }
    return host;
  }
  KH.renderMap = renderMap;

  /* ══════════ 10. 启动 ══════════ */
  function boot() {
    var file = (location.pathname.split('/').pop() || 'index.html');
    var meta = PAGES[file] || { nav: null, crumb: null };

    var navHost = document.getElementById('khNav');
    if (navHost) {
      navHost.innerHTML = navHtml(meta.active);
      bindMenu();
    }

    var crumbHost = document.getElementById('khCrumb');
    if (crumbHost) {
      var list = crumbHost.dataset.crumb ? crumbHost.dataset.crumb.split(',') : meta.crumb;
      crumbHost.outerHTML = crumbHtml(list);
    } else if (meta.crumb && meta.crumb.length > 1 && navHost) {
      var d = document.createElement('div');
      d.innerHTML = crumbHtml(meta.crumb);
      navHost.parentNode.insertBefore(d.firstChild, navHost.nextSibling);
    }

    bindReveal();
    renderDemoBar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
