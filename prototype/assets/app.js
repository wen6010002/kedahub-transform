/* 课搭 2.0 原型 · 共享底座
   1. .reveal / .rv 出场：进入视口淡入上移（配合 kh.css 的 .reveal / .reveal.in）
   2. 极简状态层 KH：四个 key 存 localStorage，页面之间能连起来走
   3. 横向滚动提示：滚到头就把渐变遮罩淡掉
   4. 弹窗无障碍：Esc 关闭 + 焦点回到触发按钮
   5. 尊重 prefers-reduced-motion
   页面自身的交互写在各自的 <script> 里，这里只放全站共用的部分。
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 出场动画 ---------- */
  var targets = document.querySelectorAll('.reveal, .rv');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. 状态层 ----------
     只有四个 key。页面读它、写它，刷新不丢，动线就能连续走完。
       kh:survey      问卷答案
       kh:taste       手感评分（探索路线每站的 1/2/3）
       kh:progress    关卡勾选与完成
       kh:submissions 提交记录
  */
  var KEY = { survey: 'kh:survey', taste: 'kh:taste', progress: 'kh:progress', submissions: 'kh:submissions' };

  var KH = {
    key: KEY,
    get: function (name, fallback) {
      try {
        var raw = localStorage.getItem(KEY[name]);
        return raw === null ? (fallback === undefined ? null : fallback) : JSON.parse(raw);
      } catch (e) {
        return fallback === undefined ? null : fallback;
      }
    },
    set: function (name, value) {
      try { localStorage.setItem(KEY[name], JSON.stringify(value)); } catch (e) { /* 无痕模式就算了 */ }
      return value;
    },
    patch: function (name, delta) {
      var cur = KH.get(name, {}) || {};
      Object.keys(delta || {}).forEach(function (k) { cur[k] = delta[k]; });
      return KH.set(name, cur);
    },
    /* 顶部那个「继续上次」用的：读最近一条进行中的路线 */
    resume: function () {
      var p = KH.get('progress', null);
      var s = KH.get('survey', null);
      if (!p && !s) return null;
      return {
        dir: (s && s.dir) || (p && p.dir) || 'AI 应用开发',
        stage: (p && p.stage) || '第 3 阶段',
        level: (p && p.level) || '第 2 关',
        at: (p && p.at) || null
      };
    },
    /* 「几天前」 */
    ago: function (iso) {
      if (!iso) return '';
      var d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
      if (isNaN(d)) return '';
      if (d <= 0) return '今天';
      if (d === 1) return '昨天';
      if (d < 30) return d + ' 天前';
      return Math.floor(d / 30) + ' 个月前';
    },
    /* 演示用：把种子数据写进去，让「继续上次」有东西可读 */
    seed: function () {
      if (!KH.get('progress', null)) {
        KH.set('progress', {
          dir: 'AI 应用开发', stage: '第 3 阶段', level: '第 2 关',
          at: new Date(Date.now() - 2 * 86400000).toISOString()
        });
      }
    }
  };
  window.KH = KH;

  /* ---------- 3. 横向滚动提示 ---------- */
  document.querySelectorAll('.hscroll').forEach(function (box) {
    function sync() {
      var max = box.scrollWidth - box.clientWidth;
      box.classList.toggle('at-start', box.scrollLeft <= 4);
      box.classList.toggle('at-end', max <= 4 || box.scrollLeft >= max - 4);
    }
    sync();
    box.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
  });

  /* ---------- 4. 弹窗无障碍 ---------- */
  /* Esc 关闭是 <dialog> 的原生行为，不用自己接。这里只做两件原生没有的事：
     点背景关闭、关闭后把焦点还给打开它的那个按钮。 */
  document.querySelectorAll('dialog').forEach(function (dlg) {
    var opener = null;
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener('close', function () {
      if (opener && document.contains(opener)) opener.focus();
      opener = null;
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-opens]');
      if (t && t.dataset.opens === dlg.id) opener = t;
    }, true);
  });
})();
