/* 课搭 2.0 原型 · 共享微交互
   - .reveal / .rv 出场：进入视口淡入上移（配合 kh.css 的 .reveal / .reveal.in）
   - 尊重 prefers-reduced-motion：用户关掉动效时直接全部显示
   页面自身的交互写在各自的 <script> 里，这里只放全站共用的部分。
*/
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal, .rv');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(function (el) { io.observe(el); });
})();
