// TikTok Pixel (mã cơ sở chính thức, đặt ở file riêng vì CSP chỉ cho script 'self').
// ID đọc từ data-id của thẻ <script>; không có ID thì không chạy.
(function () {
  var tag = document.currentScript;
  var id = tag && tag.getAttribute('data-id');
  if (!id) return;

  !function (w, d, t) {
    w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
    ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
    ttq.load = function (e, n) {
      var r = 'https://analytics.tiktok.com/i18n/pixel/events.js', o = n && n.partner;
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
      ttq._o = ttq._o || {}; ttq._o[e] = n || {};
      var s = d.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = r + '?sdkid=' + e + '&lib=' + t;
      var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(s, a);
    };
    ttq.load(id);
    ttq.page();
  }(window, document, 'ttq');

  var seen = function (key) {
    try { if (localStorage.getItem(key)) return true; localStorage.setItem(key, '1'); } catch (e) {}
    return false;
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Khách vào trang thanh toán.
    if (location.pathname.indexOf('/thanh-toan') !== -1) window.ttq.track('InitiateCheckout', { currency: 'VND' });

    // Khách đặt đơn xong (mỗi mã đơn chỉ gửi một lần, kể cả khi tải lại trang).
    var o = document.getElementById('ttq-order');
    if (o && !seen('ttq-order-' + o.dataset.code)) {
      window.ttq.track('PlaceAnOrder', {
        content_type: 'product', currency: 'VND', value: Number(o.dataset.value) || 0,
      }, { event_id: o.dataset.code });
    }
  });

  // Khách bấm nút Zalo ở bất kỳ trang nào = liên hệ.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="zalo.me"]');
    if (a) window.ttq.track('Contact');
  });
})();
