/* 冒烟测试：用 jsdom 真跑一遍页面，检查 JS 报错与关键交互 */
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const http = require('http');
const fs = require('fs');
const DIR = path.join(__dirname, '..');
let fail = 0;
function ok(c, m) { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fail++; }

/* 起一个静态服务，让 jsdom 有真实 origin（localStorage 才可用） */
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const PORT = 8731;
const server = http.createServer((req, res) => {
  const p = path.join(DIR, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' });
    res.end(buf);
  });
});
server.listen(PORT);
const BASE = 'http://127.0.0.1:' + PORT + '/';

async function load(file, opts = {}) {
  const vc = new VirtualConsole();
  const errs = [];
  /* 字体走 CDN，离线环境下取不到属正常，不计为页面错误 */
  const isFontNoise = m => /fonts\.(googleapis|gstatic)\.com/.test(m);
  vc.on('jsdomError', e => { if (!isFontNoise(e.message)) errs.push('jsdomError: ' + e.message); });
  vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ')));
  const dom = await JSDOM.fromURL(BASE + file + (opts.query || ''), {
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole: vc,
    pretendToBeVisual: true,
    beforeParse(w) {
      if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      const SP = w.SVGPathElement || w.SVGElement;
      if (SP && !SP.prototype.getTotalLength) SP.prototype.getTotalLength = () => 1000;
      if (SP && !SP.prototype.getPointAtLength) SP.prototype.getPointAtLength = () => ({ x: 0, y: 0 });
      /* 预置状态：jsdom 各实例之间不共享 localStorage */
      Object.keys(opts.seed || {}).forEach(k => {
        try { w.localStorage.setItem(k, JSON.stringify(opts.seed[k])); } catch (e) { }
      });
    }
  });
  /* 等到文档 ready 且 app.js 已执行（外部脚本加载快慢不一，别用固定等待） */
  for (let i = 0; i < 100; i++) {
    if (dom.window.document.readyState === 'complete' && dom.window.KH) break;
    await new Promise(r => setTimeout(r, 100));
  }
  // jsdom 未实现 showModal，打个桩
  if (dom.window.HTMLDialogElement) {
    dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  }
  return { dom, doc: dom.window.document, w: dom.window, errs };
}

(async () => {

  console.log('\n── 1. 全站加载 + 导航注入 ──');
  const PAGES = ['01-home.html', '02-routes.html', '03-map.html', '04-node.html',
    '05-direction.html', '06-survey.html', '07-generating.html', '08-roadmap.html',
    '09-library.html', '10-cohort.html', '11-member.html', 'index.html'];
  for (const p of PAGES) {
    const { doc, errs } = await load(p);
    const nav = doc.querySelector('#khNav .nav');
    const links = [...doc.querySelectorAll('#khNav .nav-actions > a.nav-link')].map(a => a.textContent.trim());
    const demo = doc.querySelector('#khDemo');
    ok(errs.length === 0, p + ' 无 JS 报错' + (errs.length ? ' -> ' + errs[0].slice(0, 160) : ''));
    ok(!!nav, p + ' 导航已注入');
    ok(!!demo, p + ' 演示开关已注入');
    if (p !== 'index.html') {
      ok(links.length === 4 && links.join('/') === '首页/闯关路线/项目训练营/资料库',
        p + ' 一级导航四项: ' + links.join('/'));
      ok(!links.includes('验收与付费'), p + ' 已删除「验收与付费」');
    }
  }

  console.log('\n── 2. 面包屑（全站内页） ──');
  for (const p of ['02-routes.html', '03-map.html', '04-node.html', '08-roadmap.html',
    '09-library.html', '10-cohort.html', '11-member.html']) {
    const { doc } = await load(p);
    const cb = doc.querySelector('.crumb');
    ok(!!cb, p + ' 有面包屑: ' + (cb ? cb.textContent.replace(/\s+/g, '') : '—'));
  }

  console.log('\n── 3. 闯关地图（03-map） ──');
  {
    const { doc } = await load('03-map.html', { query: '?route=m1' });
    const nodes = doc.querySelectorAll('#mpMap .mn');
    ok(nodes.length === 9, '计算机初识 渲染出 9 个节点，实际 ' + nodes.length);
    ok(doc.querySelectorAll('#mpMap .mn.done').length === 0, '未通关时没有 done 节点');
    ok(doc.querySelectorAll('#mpMap .mn.lock').length === 8, '顺序解锁：1 个当前 + 8 个锁定，实际锁定 ' + doc.querySelectorAll('#mpMap .mn.lock').length);
    ok(!!doc.querySelector('#mpMap .mn.now'), '有一个当前可挑战节点（高亮）');
    ok(doc.querySelectorAll('#mpMap .mn-cap').length === 9, '每个节点有关卡名');
  }

  console.log('\n── 4. 单关卡页（04-node）：讲解 / 课堂练习 / 过关检测 ──');
  {
    const { doc, w } = await load('04-node.html', { query: '?route=m1&n=1' });
    ok(doc.querySelector('#lvTitle').textContent.includes('电脑是怎么工作的'), '关卡标题正确');
    const segs = () => doc.querySelectorAll('#lvBody .seg:not(.gate)').length;
    const gate = () => doc.querySelector('#lvBody .seg.gate');
    const quizzes = () => doc.querySelectorAll('#lvBody .qz:not([data-final])').length;
    ok(segs() === 1 && !!gate(), '初始只显示第 1 段讲解，其余折叠隐藏（段数 ' + segs() + '）');
    ok(quizzes() === 1, '出现第 1 道课堂练习');

    // 答错：不解锁
    const q1 = doc.querySelector('#lvBody .qz');
    q1.querySelectorAll('.qz-opt')[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    ok(!!q1.querySelector('.qz-opt.wrong'), '答错标记为错误');
    ok(segs() === 1 && !!gate(), '答错后后续内容仍然折叠');

    // 答对：解锁下一段
    q1.querySelectorAll('.qz-opt')[1].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 420));
    ok(segs() === 2, '答对后解锁第 2 段讲解，当前段数 ' + segs());
    ok(quizzes() === 2, '出现第 2 道课堂练习');

    // 一路答对到过关检测
    for (let guard = 0; guard < 6; guard++) {
      const qs = doc.querySelectorAll('#lvBody .qz:not([data-final])');
      let did = false;
      qs.forEach(q => {
        if (q.querySelector('.qz-opt.right')) return;
        q.querySelectorAll('.qz-opt').forEach((b, i) => {
          if (!did && !b.disabled) { /* 需要知道答案，靠下面的正确项探测 */ }
        });
      });
      // 逐个尝试：点每一个未 disabled 的选项，直到出现 right
      const cur = [...doc.querySelectorAll('#lvBody .qz:not([data-final])')].pop();
      if (!cur || cur.querySelector('.qz-opt.right')) break;
      const opts = [...cur.querySelectorAll('.qz-opt')];
      for (const b of opts) {
        if (cur.querySelector('.qz-opt.right')) break;
        b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
        await new Promise(r => setTimeout(r, 380));
      }
      if (!cur.querySelector('.qz-opt.right')) break;
    }
    const finals = doc.querySelectorAll('#lvBody .qz[data-final]');
    ok(finals.length === 1, '全部练习答对后出现过关检测');

    // 过关检测：先提交一次拿到正确答案标注，再重做
    const fb = doc.querySelector('#lvBody .qz[data-final]');
    fb.querySelector('#finalSubmit').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 700));
    const answers = [...fb.querySelectorAll('.qz-item')]
      .map(it => (it.querySelector('.qz-opt.right') || {}).dataset?.k);
    ok(answers.every(a => a !== undefined), '提交后标出每道题的正确答案：' + answers.join(','));
    await new Promise(r => setTimeout(r, 2000));   // 等重置
    [...fb.querySelectorAll('.qz-item')].forEach((it, i) => {
      const b = it.querySelector('.qz-opt[data-k="' + answers[i] + '"]');
      b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    });
    fb.querySelector('#finalSubmit').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 600));
    const dlg = doc.querySelector('#celeDlg');
    ok(dlg && dlg.hasAttribute('open'), '过关检测通过后弹出庆祝弹窗');
    ok(!!doc.querySelector('#celeNext') && !!doc.querySelector('#celeBack'), '弹窗提供「进入下一关 / 标记完成并返回」');
    ok(w.KH.isDone('m1', 1), '节点状态已更新为已通关');
    ok(w.KH.xp() === 340, 'XP 增加 20，当前 ' + w.KH.xp());
  }

  console.log('\n── 5. 会员 Banner 鉴权（02-routes） ──');
  {
    const { doc, w, errs } = await load('02-routes.html');
    ok(errs.length === 0, '02-routes 无 JS 报错 ' + errs[0] || '');
    ok(!!doc.querySelector('.gold'), '橘金色会员 Banner 存在（非会员也可见）');
    ok(doc.querySelector('.gold-badge').textContent.includes('会员专享'), '带「会员专享」角标');
    const order = [...doc.querySelectorAll('main .rt-head, main .gold, main .split, main .rc')]
      .map(e => e.className.split(' ')[0]).slice(0, 4);
    ok(order.join('>') === 'rt-head>gold>split>rc', '页面顺序：说明 > Banner > 分割线 > 免费路线列表，实际 ' + order.join('>'));
    ok(doc.querySelectorAll('#routeList .rc-card').length === 6, '免费路线列表 6 条，实际 ' + doc.querySelectorAll('#routeList .rc-card').length);
    ok(doc.querySelector('.rt-head h1').textContent.trim() === '闯关路线', '主标题就是「闯关路线」，不再带「41 关全部免费」');
    ok(!doc.querySelector('#routeList').textContent.includes('主干') &&
       !doc.querySelector('#routeList').textContent.includes('选做'), '路线卡片不再区分主干 / 选做');
    ok(doc.querySelectorAll('#routeList .rc-card.locked').length === 0, '没有任何一张地图被锁');

    doc.querySelector('#vipEnter').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const dlg = doc.querySelector('#khVipDlg');
    ok(!!dlg, '升级模态已创建');
    if (dlg) {
      ok(dlg.hasAttribute('open'), '非会员点击 Banner 弹出升级模态');
      ok(dlg.textContent.includes('本路线为会员专属内容'), '弹窗文案符合要求');
      ok(!!dlg.querySelector('a[href="11-member.html"]'), '弹窗提供跳转会员中心按钮');
    }
  }

  console.log('\n── 6. 会员专属路线身份校验（08-roadmap） ──');
  {
    const { doc } = await load('08-roadmap.html');
    ok(doc.querySelector('#vrLock').hidden === false, '非会员进入被拦在锁态页');
    ok(doc.querySelector('#vrOpen').hidden === true, '非会员看不到地图');
    ok(doc.querySelector('#vrStagesPreview').children.length === 3, '非会员能看到阶段预览');
  }
  const VIP = { 'kh:member': { vip: true, until: '2027-03-20', plan: '学年' } };
  {
    const { doc } = await load('08-roadmap.html', { seed: VIP });
    ok(doc.querySelector('#vrOpen').hidden === false, '会员进入直接看到专属路线地图');
    ok(doc.querySelector('#vrLock').hidden === true, '会员不再看到锁态页');
    ok(doc.querySelectorAll('#vrMap .mn').length === 12, '专属路线 12 关，实际 ' + doc.querySelectorAll('#vrMap .mn').length);
    ok(!!doc.querySelector('.avatar-btn.is-member'), '会员头像带会员标记');
  }
  {
    const d2 = await load('03-map.html', { query: '?route=m1', seed: VIP });
    const sw = d2.doc.querySelector('#khJump');
    ok(!!sw && !sw.disabled, '会员可开启自由解锁开关');
    ok(d2.doc.querySelectorAll('#mpMap .mn.lock').length === 8, '默认仍顺序解锁（锁定 8）');
    sw.checked = true;
    sw.dispatchEvent(new d2.w.Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    ok(d2.doc.querySelectorAll('#mpMap .mn.lock').length === 0, '开启自由解锁后无锁定节点');
  }
  {
    /* 普通用户把整条路线走完 → 也开放自由解锁 */
    const all = {}; for (let i = 1; i <= 9; i++) all[i] = i;
    const d3 = await load('03-map.html', { query: '?route=m1', seed: { 'kh:levels': { m1: [1, 2, 3, 4, 5, 6, 7, 8, 9] } } });
    const sw = d3.doc.querySelector('#khJump');
    ok(!!sw && !sw.disabled, '普通用户全部通关后也开放自由解锁开关');
    ok(d3.doc.querySelectorAll('#mpMap .mn.done').length === 9, '全部通关后 9 个节点都点亮');
  }

  console.log('\n── 7. 会员中心（11-member） ──');
  {
    const { doc } = await load('11-member.html');
    ok(!!doc.querySelector('.mem-hero'), '顶部会员有效期状态卡');
    ok(doc.querySelectorAll('#plans .plan').length === 3, '月 / 季 / 学年三档套餐');
    ok(doc.querySelector('#plans').textContent.includes('月付') &&
      doc.querySelector('#plans').textContent.includes('季付') &&
      doc.querySelector('#plans').textContent.includes('学年'), '三档名称正确');
    ok(doc.querySelectorAll('.ben-card').length === 3, '三大块权益清单');
    ok(doc.querySelectorAll('.res').length === 3, '会员专属资源入口 3 个');
    ok(!!doc.querySelector('#logBox .log-row'), '权益使用记录');
  }

  console.log('\n── 8. 首页工作台（01-home） ──');
  {
    const { doc } = await load('01-home.html');
    ok(doc.querySelector('#wbLogged').hidden === false, '已登录显示工作台');
    ok(!!doc.querySelector('.wb-hero'), '闯关进度卡置顶');
    ok(doc.querySelectorAll('.wb-quick .wb-q').length === 4, '4 个快捷入口（含资料库/方向科普）');
    ok(doc.querySelector('.wb-quick').textContent.includes('方向科普'), '快捷入口含方向科普');
    ok(!!doc.querySelector('.wb-quick a[href="05-direction.html"]'), '方向科普入口指向 05-direction.html');
    ok(!doc.querySelector('.wb-quick').textContent.includes('会员中心'), '快捷入口不再放会员中心');
    ok(!!doc.querySelector('.camp-card'), '在参与的项目训练营卡片');
    /* 登录用户也能做路线引导问卷 */
    ok(!!doc.querySelector('#svyEntry'), '已登录工作台里有路线引导问卷入口');
    ok(doc.querySelector('#svyGo').getAttribute('href') === '06-survey.html', '问卷入口指向 06-survey');
    const rows = [...doc.querySelectorAll('.hot-card .feed-row')];
    ok(rows.length === 3, '热门资料 3 条，实际 ' + rows.length);
    ok(rows.every(r => !r.getAttribute('style')), '热门资料行不再用内联 padding（橙色装饰不再压住序号）');
  }
  {
    /* 做过问卷的登录用户：入口文案变成「重做」并显示上次推荐 */
    const { doc } = await load('01-home.html', { seed: { 'kh:survey': { dir: 'AI 应用', grade: '大二', hours: 2 } } });
    ok(doc.querySelector('#svyTitle').textContent.includes('重做'), '做过问卷后入口变成「重做」');
    ok(doc.querySelector('#svyDesc').textContent.includes('AI 应用开发'), '入口显示上次推荐的路线方向');
  }

  console.log('\n── 9. 关卡内容库（assets/levels.js） ──');
  {
    const { JSDOM: JD } = require('jsdom');
    const fs = require('fs');
    const src = fs.readFileSync(path.join(DIR, 'assets', 'levels.js'), 'utf8');
    const d = new JD('<html></html>', { runScripts: 'outside-only' });
    d.window.eval(src);
    const L = d.window.LEVELS || {};
    const ks = Object.keys(L);
    ok(ks.length === 30, '主干 30 关已录入，实际 ' + ks.length);
    ['m1-1', 'm1-9', 'm2-1', 'm2-11', 'm3-1', 'm3-10'].forEach(k => ok(!!L[k], k + ' 已录入'));
    let bad = [];
    ks.forEach(k => {
      const s = L[k].segs;
      if (s[s.length - 1].t !== 'final') bad.push(k + ' 末尾不是过关检测');
      if (s.filter(x => x.t === 'text').length < 3) bad.push(k + ' 讲解段不足');
      if (s.filter(x => x.t === 'quiz').length < 2) bad.push(k + ' 课堂练习不足');
      s.forEach((x, i) => {
        if (x.t === 'quiz' && !(x.a >= 0 && x.a < x.opts.length)) bad.push(k + '#' + i + ' 答案越界');
        if (x.t === 'final') x.qs.forEach((q, j) => {
          if (!(q.a >= 0 && q.a < q.opts.length)) bad.push(k + ' 检测第' + (j + 1) + '题答案越界');
        });
      });
    });
    ok(bad.length === 0, '全部关卡结构合法' + (bad.length ? ' -> ' + bad.slice(0, 3).join('; ') : ''));
  }
  {
    /* 抽查三关：真实内容能渲染，且不是占位 */
    for (const q of ['?route=m1&n=3', '?route=m2&n=7', '?route=m3&n=5']) {
      const { doc, errs } = await load('04-node.html', { query: q });
      const ph = doc.querySelector('#lvPhTip');
      ok(errs.length === 0, q + ' 无 JS 报错 ' + (errs[0] || ''));
      ok(ph && ph.hidden === true, q + ' 走的是真实内容，不是占位');
      ok(doc.querySelectorAll('#lvBody .seg:not(.gate)').length === 1, q + ' 初始只显示第一段讲解');
      ok(!!doc.querySelector('#lvBody .qz'), q + ' 出现课堂练习');
    }
    /* 选做模块目前是占位结构 */
    const { doc } = await load('04-node.html', { query: '?route=m4&n=1' });
    ok(doc.querySelector('#lvPhTip').hidden === false, '选做关卡明确标注为示例结构');
  }

  console.log('\n── 10. 空状态 ──');
  {
    const { doc } = await load('01-home.html', { seed: { 'kh:levels': {} } });
    ok(doc.querySelector('.wb-k').textContent.includes('还没开始闯关') &&
      doc.querySelector('.wb-body h2').textContent.includes('从第一关开始'), '零进度时首页显示空状态');
    ok(doc.querySelector('#wbGo').textContent.includes('开始第 1 关'), '空状态给出明确的开始按钮');
  }
  {
    const { doc } = await load('02-routes.html', { seed: { 'kh:levels': {} } });
    ok(doc.querySelector('#rtStart').hidden === false, '零进度时路线页显示「从第一关走起」');
    ok(doc.querySelector('#stDone').textContent === '0', '统计显示 0 已通关');
  }
  {
    const { doc } = await load('01-home.html', { seed: { 'kh:levels': { m1: [1, 2, 3] } } });
    ok(doc.querySelector('.wb-body h2').textContent.includes('继续') ||
      doc.querySelector('.wb-body h2').textContent.includes('关'), '有进度时显示继续闯关');
    ok(doc.querySelector('#qLevel').textContent.includes('已通关 3 关'), '快捷入口同步进度');
  }

  console.log('\n── 11. 第四轮修订：通关回顾 / 地图页删卡 / 资料库改版 ──');
  {
    /* 11-1 通关后保留解锁状态（04-node 回顾模式） */
    const { doc, w } = await load('04-node.html', { query: '?route=m1&n=1', seed: { 'kh:levels': { m1: [1, 2] } } });
    ok(doc.querySelector('#lvReviewTip').hidden === false, '通关后再进入：显示回顾模式提示');
    ok(!doc.querySelector('#lvBody .seg.gate'), '通关后不再有折叠闸门');
    ok(doc.querySelectorAll('#lvBody .seg:not(.gate)').length >= 3,
      '全部讲解段直接展开，实际 ' + doc.querySelectorAll('#lvBody .seg:not(.gate)').length + ' 段');
    const qz = [...doc.querySelectorAll('#lvBody .qz:not([data-final])')];
    ok(qz.length >= 2, '课堂练习全部可见，实际 ' + qz.length);
    ok(qz.every(q => q.querySelector('.qz-opt.right')), '课堂练习直接标出正确答案');
    ok(qz.every(q => q.querySelector('.qz-fb.show')), '课堂练习的解析直接展开');
    const fb = doc.querySelector('#lvBody .qz[data-final]');
    ok(!!fb && fb.classList.contains('is-review'), '过关检测进入回顾态');
    ok(fb.querySelectorAll('.qz-opt.right').length === fb.querySelectorAll('.qz-item').length, '过关检测每题都标出正确答案');
    ok(fb.querySelector('#finalSubmit').disabled === true, '回顾态不再要求重新提交');
    ok(doc.querySelectorAll('#lvSteps .ls-item.on').length === doc.querySelectorAll('#lvSteps .ls-item').length,
      '侧栏结构清单全部点亮');
    w.KH.unfinish('m1', 1);
    ok(w.KH.isDone('m1', 1) === false && w.KH.isDone('m1', 2) === true, '「再走一遍」只重置这一关，不影响其它关');
  }
  {
    /* 11-2 闯关地图页：删掉两个说明卡片 */
    const { doc } = await load('03-map.html', { query: '?route=m1' });
    const side = doc.querySelector('.mp-side').textContent;
    ok(!side.includes('这一关怎么走'), '侧栏已删除「这一关怎么走」卡片');
    ok(!side.includes('解锁规则'), '侧栏已删除「解锁规则」卡片');
    ok(!!doc.querySelector('.mp-side .mp-prog'), '侧栏改成路线进度卡');
    ok(doc.querySelector('#mpTotalN').textContent === '9', '进度卡显示总关数 9');
    ok(!!doc.querySelector('.mp-tip'), '关键说明压缩成一行提示保留在地图上方');
  }
  {
    /* 11-3 资料库改版 */
    const { doc, w } = await load('09-library.html');
    const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

    ok(!!doc.querySelector('#catScroll .lib-cats'), '顶部分类条放进横向滚动容器（不折行溢出）');
    ok(!!doc.querySelector('#btnReset') && doc.querySelector('#btnReset').textContent.includes('清除筛选'),
      '筛选面板顶部有显眼的「清除筛选」');
    ok(doc.querySelectorAll('#fgroups .fgroup').length === 4, '筛选分组 4 组：分类 / 权限 / 类型 / 排序');
    ok(doc.querySelectorAll('#fgroups .fg-head').length === 4, '每组都带折叠开关');
    const fg = doc.querySelector('#fgroups .fgroup');
    click(fg.querySelector('.fg-head'));
    ok(fg.classList.contains('closed'), '点分组标题可折叠');
    click(fg.querySelector('.fg-head'));
    ok(!fg.classList.contains('closed'), '再点一次可展开');

    const rows = [...doc.querySelectorAll('#libList [data-id]')];
    ok(rows.length === 6, '每页 6 条，实际 ' + rows.length);
    ok(rows.every(r => !r.querySelector('.go-node')), '资料条目底部已删掉「去第 N 关」跳转按钮');
    /* 搜出 GitHub 那一份，确认它仍能正常展开阅读 */
    doc.querySelector('#searchInput').value = 'GitHub';
    doc.querySelector('#searchInput').dispatchEvent(new w.Event('input', { bubbles: true }));
    const gitRow = doc.querySelector('#libList [data-id]');
    ok(gitRow && gitRow.textContent.includes('GitHub 淘金地图'), '搜索仍能定位到 GitHub 那份资料');
    ok(gitRow && !gitRow.querySelector('.go-node'), '搜索结果里也没有「去第 N 关」按钮');
    click(doc.querySelector('#btnSearchClear'));
    ok(doc.querySelectorAll('#libList [data-id]').length === 6, '清除搜索后恢复列表');

    click(doc.querySelector('#viewSw button[data-view="grid"]'));
    ok(doc.querySelectorAll('#libList .mcard').length === 6, '切到网格卡片视图');
    ok([...doc.querySelectorAll('#libList .mcard')].every(c => !c.querySelector('.go-node')), '网格卡片也没有闯关站点按钮');
    click(doc.querySelector('#viewSw button[data-view="list"]'));
    ok(doc.querySelectorAll('#libList .feed-row').length === 6, '切回列表视图');

    /* 权限筛选：精点会员资料 */
    const vipOpt = [...doc.querySelectorAll('#fgroups .fopt')].find(b => b.getAttribute('data-val') === '精点');
    click(vipOpt);
    const vipRows = [...doc.querySelectorAll('#libList [data-id]')];
    ok(vipRows.length === 4, '权限筛「精点」得到 4 份，实际 ' + vipRows.length);
    ok(vipRows.every(r => r.querySelector('.fr-pill.vip')), '精点资料都有醒目的会员标签');
    ok(doc.querySelector('#btnReset').classList.contains('on'), '有筛选条件时「清除筛选」高亮');

    /* 非会员点会员资料：非侵入提示，绝不强制弹窗 */
    click(vipRows[0]);
    ok(!!doc.querySelector('.softup.show'), '非会员点开会员资料 → 右下角非侵入提示');
    ok(doc.querySelectorAll('dialog[open]').length === 0, '没有强制弹窗（无自动打开的模态）');
    ok(!vipRows[0].classList.contains('is-open'), '非会员不会被当成已解锁而展开');

    click(doc.querySelector('#btnReset'));
    ok(doc.querySelectorAll('#libList [data-id]').length === 6 && !doc.querySelector('#btnReset').classList.contains('on'),
      '「清除筛选」一键恢复全部资料');

    /* 基础资料永久免费可读 —— 且不再弹「基础资料，永久免费可读」黑框 */
    const freeRow = [...doc.querySelectorAll('#libList [data-id]')].find(r => r.querySelector('.fr-pill.free'));
    click(freeRow);
    ok(freeRow.classList.contains('is-open'), '基础资料点开即可读');
    const toastEl = doc.querySelector('.toast');
    ok(!toastEl || !toastEl.classList.contains('show'), '点开资料不再弹任何黑框提示（toast）');

    /* 空状态 + 分页 */
    ok(doc.querySelector('#pager').hidden === false, '有结果时保留分页');
    const si = doc.querySelector('#searchInput');
    si.value = 'zzzzzzz';
    si.dispatchEvent(new w.Event('input', { bubbles: true }));
    ok(doc.querySelector('#libEmpty').hidden === false, '筛选结果为空时给出友好空状态');
    ok(doc.querySelector('#pager').hidden === true, '空状态时不显示分页');
    click(doc.querySelector('#btnEmptyReset'));
    ok(doc.querySelector('#libEmpty').hidden === true && doc.querySelectorAll('#libList [data-id]').length === 6,
      '空状态里「清除全部筛选」可一键复原');

    /* 右侧栏：已删掉会员卡片，顺序重排 */
    const st = doc.querySelector('.lib-side').textContent;
    ok(!doc.querySelector('.lib-side .side-vip'), '右侧栏已删掉会员权益卡片');
    ok(!st.includes('会员权益'), '侧栏不再出现「会员权益」字样');
    ok(st.indexOf('别在这儿瞎逛') < st.indexOf('本周收藏榜') &&
       st.indexOf('本周收藏榜') < st.indexOf('公告'), '右侧栏顺序：回流引导 > 收藏榜 > 公告');

    /* 左侧筛选栏独立滚动（看 CSS 是否给了自己的滚动区 + 阻止滚动穿透） */
    const css = fs.readFileSync(path.join(DIR, '09-library.html'), 'utf8');
    ok(/\.filters\s*\{[^}]*overflow-y:\s*auto/.test(css), '筛选栏有自己的纵向滚动区');
    ok(/\.filters\s*\{[^}]*overscroll-behavior:\s*contain/.test(css), '筛选栏滚到头不带着页面一起滚');
    ok(/\.filters\s*\{[^}]*max-height/.test(css), '筛选栏限高，长列表自己滚');
    ok(!/class="go-node"/.test(css), '模板里不再有 go-node 跳转按钮');
  }
  {
    /* 会员状态下不再提示升级 */
    const { doc, w } = await load('09-library.html', { seed: { 'kh:member': { vip: true, until: '2027-03-20', plan: '学年' } } });
    ok(!doc.querySelector('.side-vip'), '会员进入也不再显示会员权益卡');
    const vipOpt = [...doc.querySelectorAll('#fgroups .fopt')].find(b => b.getAttribute('data-val') === '精点');
    vipOpt.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const r = doc.querySelector('#libList [data-id]');
    r.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    ok(r.classList.contains('is-open'), '会员点开精点资料直接可读');
    ok(!doc.querySelector('.softup.show'), '会员不再收到升级提示');
  }

  console.log('\n── 12. 第五轮修订：地图自由挑 / 更多闯关地图 / 生成页分流 ──');
  {
    /* 12-1 没有主干 / 选做之分：任何一张地图都能直接进 */
    const { doc, errs } = await load('03-map.html', { query: '?route=m6' });
    ok(errs.length === 0, '?route=m6 无 JS 报错 ' + (errs[0] || ''));
    ok(doc.querySelector('#mpTitle').textContent.includes('算法工程师初识'),
      '零进度也能直接打开「算法工程师初识」地图，不再被退回主干，实际：' + doc.querySelector('#mpTitle').textContent);
    ok(doc.querySelectorAll('#mpMap .mn').length === 3, '该地图 3 个节点正常渲染');
    /* 专题地图（更多闯关地图里的）也能直接进 */
    const x = await load('03-map.html', { query: '?route=x2' });
    ok(x.doc.querySelector('#mpTitle').textContent.includes('Web 安全初识'), '专题地图 x2 也能直接打开');
    ok(x.doc.querySelectorAll('#mpMap .mn').length === 6, '专题地图节点数正确');
  }
  {
    /* 12-2 更多闯关地图 */
    const { doc, w } = await load('02-routes.html');
    const more = doc.querySelector('#moreList');
    ok(!!more, '存在「更多闯关地图」区域');
    ok(more.hidden === true, '默认收起');
    ok(more.querySelectorAll('.rc-card').length === 5, '里面 5 张专题地图，实际 ' + more.querySelectorAll('.rc-card').length);
    ok(more.querySelectorAll('.rc-card.locked').length === 0, '专题地图也全部开放，没有锁');
    const btn = doc.querySelector('#btnMore');
    btn.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    ok(more.hidden === false, '点「展开」后显示专题地图');
    ok(btn.textContent.includes('收起'), '按钮切换成「收起」');
    btn.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    ok(more.hidden === true, '再点一次收起');
    ok(!!doc.querySelector('#moreList .rc-card a[href^="03-map.html?route="]'), '专题地图可直接进地图页');
  }
  {
    /* 12-3 生成页：会员走专属路线，非会员走普通闯关路线 */
    const g = await load('07-generating.html', { seed: { 'kh:survey': { dir: 'AI 应用', grade: '大二', hours: 2, prior: '课程作业量' } } });
    const go = g.doc.querySelector('#goRoute');
    ok(!!go, '生成页有「进入我的路线」按钮');
    ok(go.getAttribute('href') === '02-routes.html', '非会员 → 跳普通闯关路线，实际 ' + go.getAttribute('href'));
    ok(go.textContent.includes('闯关路线'), '非会员按钮文案是「进入我的闯关路线」');
    /* 点「跳过动画」直接看结果 */
    g.doc.querySelector('#btnSkip').dispatchEvent(new g.w.MouseEvent('click', { bubbles: true }));
    ok(g.doc.querySelector('#genRec').hidden === false, '生成完成后给出推荐地图卡');
    ok(g.doc.querySelector('#grGo').getAttribute('href') === '03-map.html?route=m3',
      '按问卷方向（AI 应用）推荐 AI 初识地图，实际 ' + g.doc.querySelector('#grGo').getAttribute('href'));
    ok(g.doc.querySelector('#grName').textContent.includes('AI 初识'), '推荐地图名称正确');

    const g2 = await load('07-generating.html', { seed: { 'kh:member': { vip: true, until: '2027-03-20', plan: '学年' },
                                                          'kh:survey': { dir: '前端', grade: '大三', hours: 3 } } });
    const go2 = g2.doc.querySelector('#goRoute');
    ok(go2.getAttribute('href') === '08-roadmap.html', '会员 → 跳会员专属进阶路线，实际 ' + go2.getAttribute('href'));
    ok(go2.textContent.includes('专属'), '会员按钮文案是「进入我的专属路线」');
    g2.doc.querySelector('#btnSkip').dispatchEvent(new g2.w.MouseEvent('click', { bubbles: true }));
    ok(g2.doc.querySelector('#grGo').getAttribute('href') === '03-map.html?route=m2',
      '按问卷方向（前端）推荐前后端初识地图');
  }
  {
    /* 12-4 问卷入口：登录用户也能做 */
    const { doc } = await load('06-survey.html');
    ok(!!doc.querySelector('#svyTip'), '问卷页对已登录用户给出说明');
    ok(doc.querySelector('#svyTip').textContent.includes('已登录'), '说明写明「已登录也能做」');
    ok(doc.querySelector('#rvNext') !== null || doc.querySelector('.rv-next'), '确认屏提示下一步会进生成页');

    /* 第六轮：确认屏整块置顶 + 两边留空 + 底部条按钮换功能 */
    const flow = doc.querySelector('#svFlow');
    const rev  = doc.querySelector('#svReview');
    ok(!!rev && !!flow, '确认屏与答题区各自成块');
    ok(!!(rev.compareDocumentPosition(flow) & 4), '确认屏排在答题区前面（点击后置顶）');
    ok(rev.parentElement === doc.querySelector('main.page'), '确认屏在页面容器内，左右留空与其它区块一致');
    const css6 = fs.readFileSync(path.join(DIR, '06-survey.html'), 'utf8');
    ok(/\.sv-review\s*\{\s*max-width:\s*1280px/.test(css6), '确认屏容器宽度 1280，与页头 / 进度条一致');
    ok(!doc.querySelector('#btnReviewBack'), '「回去改一改」按钮已移除（与「上一步」重复）');
  }
  {
    /* 走完 16 题 → 确认屏置顶；底部条按钮变成「生成我的专属路线」 */
    const s = await load('06-survey.html');
    const { doc, w } = s;
    const btnNext = doc.querySelector('#btnNext');
    const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    for (let i = 0; i < 16; i++) {
      const q = doc.querySelector('.q.on');
      const opt = q && q.querySelector('.opts .opt');
      if (opt) click(opt);
      click(btnNext);
    }
    ok(doc.querySelector('#svReview').hidden === false, '最后一题点「看看会排成什么样」弹出确认屏');
    ok(doc.querySelector('#svFlow').hidden === true, '确认屏出现时答题区（页头/进度/侧栏）整体隐藏');
    ok(btnNext.textContent.includes('生成我的专属路线'), '底部条按钮变成「生成我的专属路线」');
    ok(btnNext.disabled === false, '生成按钮可点');
    const btnPrev = doc.querySelector('#btnPrev');
    ok(btnPrev.textContent.includes('上一步'), '底部条保留「上一步」');
    /* 「上一步」承担原来「回去改一改」的功能：回到第 16 题 */
    click(btnPrev);
    ok(doc.querySelector('#svReview').hidden === true && doc.querySelector('#svFlow').hidden === false,
      '点「上一步」回到答题区');
    ok(btnNext.textContent.includes('看看会排成什么样'), '回到第 16 题后按钮恢复「看看会排成什么样」');
  }
  {
    /* 12-5 首页热门资料：橙色装饰不再压住序号 */
    const { doc } = await load('01-home.html');
    const css = fs.readFileSync(path.join(DIR, '01-home.html'), 'utf8');
    ok(!!doc.querySelector('.hot-card .feed-row'), '热门资料用 .hot-card 包起来');
    ok(/\.hot-card\s+\.feed-row::before\s*\{[^}]*left:\s*-\d+px/.test(css), '橙色装饰条外移，不与序号重叠');
    ok([...doc.querySelectorAll('.hot-card .feed-date b')].map(b => b.textContent).join('/') === '01/02/03',
      '序号 01/02/03 仍在');
  }

  console.log('\n' + (fail === 0 ? '✅ 全部通过' : '❌ 失败 ' + fail + ' 项'));
  process.exit(fail === 0 ? 0 : 1);
})();
