// Ảnh khách đặt vào khung in. Mỗi dòng giỏ hàng có một mã (uid) và một thư mục data/uploads/<uid>/,
// mỗi khung là một file 000.jpg, 001.jpg… do trình duyệt đã cắt sẵn đúng khung (55 × 80 mm, 300 dpi).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', 'data', 'uploads');
const UID = /^[a-f0-9]{16}$/;
const FILE = /^\d{3}\.jpg$/;
const MAX_BYTES = 3 * 1024 * 1024;
const ABANDONED_MS = 3 * 24 * 60 * 60 * 1000; // ảnh của giỏ hàng không thành đơn: xoá sau 3 ngày

const newUid = () => crypto.randomBytes(8).toString('hex');
const isUid = (uid) => UID.test(String(uid));
const dirOf = (uid) => path.join(ROOT, uid);
const fileName = (slot) => String(slot).padStart(3, '0') + '.jpg';

// Các khung đã có ảnh, theo thứ tự.
function slots(uid) {
  if (!isUid(uid)) return [];
  try {
    return fs.readdirSync(dirOf(uid)).filter((f) => FILE.test(f)).map((f) => parseInt(f, 10)).sort((a, b) => a - b);
  } catch { return []; }
}

const isJpeg = (buf) => Buffer.isBuffer(buf) && buf.length > 1000 && buf.length <= MAX_BYTES &&
  buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

function save(uid, slot, buf) {
  fs.mkdirSync(dirOf(uid), { recursive: true });
  const file = path.join(dirOf(uid), fileName(slot));
  fs.writeFileSync(file + '.tmp', buf);
  fs.renameSync(file + '.tmp', file);
}

function remove(uid, slot) {
  try { fs.unlinkSync(path.join(dirOf(uid), fileName(slot))); } catch { /* khung đã trống */ }
}

function removeAll(uid) {
  if (isUid(uid)) fs.rmSync(dirOf(uid), { recursive: true, force: true });
}

// Đường dẫn file để gửi cho trình duyệt; null nếu tên không hợp lệ hoặc không có file.
function filePath(uid, file) {
  if (!isUid(uid) || !FILE.test(file)) return null;
  const p = path.join(dirOf(uid), file);
  return fs.existsSync(p) ? p : null;
}

// Xoá thư mục ảnh của giỏ hàng bỏ dở: không thuộc đơn nào và không được sửa trong 3 ngày.
// Ảnh của đơn hàng không bao giờ bị xoá tự động.
function cleanup(orderUids) {
  let names = [];
  try { names = fs.readdirSync(ROOT); } catch { return; }
  const now = Date.now();
  names.filter((n) => isUid(n) && !orderUids.has(n)).forEach((n) => {
    try {
      if (now - fs.statSync(dirOf(n)).mtimeMs > ABANDONED_MS) removeAll(n);
    } catch { /* đã bị xoá */ }
  });
}

module.exports = { MAX_BYTES, newUid, isUid, slots, isJpeg, save, remove, removeAll, filePath, fileName, cleanup };
