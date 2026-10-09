(function () {
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-autosubmit]').forEach(function (el) {
    el.addEventListener('change', function () { el.form.submit(); });
  });
  // Bước gửi ảnh: chỉ bắt buộc nhập link khi khách chọn "dán link album".
  var link = document.querySelector('[data-photo-link]');
  var modes = document.querySelectorAll('[data-photo-mode]');
  function syncPhoto() {
    var useLink = document.querySelector('[data-photo-mode][value=link]').checked;
    link.hidden = !useLink;
    link.querySelector('input').required = useLink;
  }
  if (link && modes.length) {
    modes.forEach(function (m) { m.addEventListener('change', syncPhoto); });
    syncPhoto();
  }
  document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (!window.confirm(f.getAttribute('data-confirm'))) e.preventDefault();
    });
  });
})();
