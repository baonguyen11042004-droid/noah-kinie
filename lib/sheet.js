// Đồng bộ đơn hàng với Google Sheet "Đơn hàng Kinie" qua Apps Script (apps-script/don-hang.gs).
// Web -> Sheet: gửi đơn mới và mỗi lần đổi trạng thái tới ORDERS_HOOK_URL (Apps Script gửi Gmail báo đơn mới).
// Sheet -> web: Apps Script gọi POST /api/sheet/status khi CEO đổi cột Trạng thái. Hai chiều dùng chung ORDERS_HOOK_SECRET.
const crypto = require('crypto');

const HOOK = process.env.ORDERS_HOOK_URL || '';
const SECRET = process.env.ORDERS_HOOK_SECRET || '';
const enabled = () => Boolean(HOOK && SECRET);

// Kết quả lần gửi gần nhất, hiện trong /admin.
const last = { at: '', ok: null, error: '' };

function checkSecret(value) {
  if (!SECRET || typeof value !== 'string') return false;
  const a = Buffer.from(value), b = Buffer.from(SECRET);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function send(payload) {
  if (!enabled()) return false;
  try {
    // Apps Script trả 302 sang googleusercontent.com; fetch tự theo và đọc kết quả JSON ở đó.
    const r = await fetch(HOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: SECRET, ...payload }), signal: AbortSignal.timeout(20000),
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch {
      throw new Error('Apps Script không trả JSON (HTTP ' + r.status + '): kiểm tra đã Triển khai ứng dụng web với quyền "Bất kỳ ai"');
    }
    if (!data.ok) throw new Error(data.error || 'Apps Script báo lỗi');
    Object.assign(last, { at: new Date().toISOString(), ok: true, error: '' });
    return true;
  } catch (e) {
    Object.assign(last, { at: new Date().toISOString(), ok: false, error: e.message });
    console.error('Google Sheet:', e.message);
    return false;
  }
}

module.exports = { enabled, checkSecret, send, last };
