(function () {
  var root = document.documentElement;
  var KEY = 'kinie-theme';
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function systemDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function apply(t) {
    root.setAttribute('data-theme', t);
    var b = document.getElementById('theme-toggle');
    if (b) {
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
    }
  }
  apply(stored() || (systemDark() ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('theme-toggle');
    if (!b) return;
    apply(root.getAttribute('data-theme'));
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  });

  // Nếu người dùng chưa chọn tay, theo cài đặt hệ thống
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
  }
})();
