/**
 * ĐƠN HÀNG KINIE: nối Google Sheet với web kinie.online (Google Apps Script, gắn trong Sheet "Khách trên web Kinie").
 *
 * Cách hoạt động:
 *  - Web -> Sheet: mỗi đơn mới và mỗi lần đổi trạng thái trong /admin, web gửi đơn tới ứng dụng web của script này
 *    (doPost). Script thêm hoặc sửa đúng dòng của đơn đó trong tab "Đơn hàng".
 *  - Đơn mới: gửi Gmail báo CEO (địa chỉ ở Script Properties, tên NOTIFY_EMAIL).
 *  - Sheet -> web: CEO đổi cột C "Trạng thái" (bằng tay, cả trên app điện thoại), script gọi
 *    https://kinie.online/api/sheet/status để /admin đổi theo. Web không nhận được thì ô quay về trạng thái cũ
 *    và có ghi chú "Chưa cập nhật lên web".
 *  - Chỉ đổi được trạng thái từ Sheet. Tên, SĐT, tiền, ảnh chỉ sửa trên web (sửa trên Sheet sẽ bị ghi đè lần đồng bộ sau).
 *
 * Cài (một lần, xem README của web kinie):
 *  1. Mở Sheet > Tiện ích mở rộng > Apps Script, dán file này, Lưu.
 *  2. Chạy hàm caiDat, bấm Cho phép. MÃ BÍ MẬT hiện trong Nhật ký thực thi (hoặc Project Settings > Script Properties > SECRET,
 *     hoặc menu Kinie > Xem mã bí mật trong Sheet) -> dán vào ORDERS_HOOK_SECRET trên Hostinger.
 *  3. Triển khai > Tùy chọn triển khai mới > Ứng dụng web. Thực thi với tư cách: Tôi. Ai có quyền truy cập: Bất kỳ ai.
 *     Chép URL ứng dụng web -> dán vào ORDERS_HOOK_URL trên Hostinger.
 *  4. Vào /admin, bấm "Gửi lại tất cả đơn sang Sheet" để đưa các đơn cũ sang.
 * Sửa mã này sau khi đã triển khai: Triển khai > Quản lý bản triển khai > sửa > Phiên bản mới (giữ nguyên URL).
 *
 * Mã bí mật KHÔNG nằm trong file này: lưu ở Project Settings > Script Properties, tên SECRET.
 */

const CAU_HINH = {
  TAB_DON: 'Đơn hàng',
  TAB_THONG_KE: 'Thống kê',
  WEB_URL: 'https://kinie.online',
  MUI_GIO: 'Asia/Ho_Chi_Minh',
  // Phải trùng chữ với STATUS trong server.js của web.
  TRANG_THAI: ['Chờ thanh toán', 'Đã nhận tiền', 'Đã xác nhận', 'Đang giao', 'Hoàn thành', 'Đã huỷ', 'Mới (đơn cũ)'],
  CHO_THANH_TOAN: 'Chờ thanh toán',
  DA_HUY: 'Đã huỷ',
};

// Cột tab "Đơn hàng"
const TIEU_DE = ['Mã đơn', 'Ngày đặt', 'Trạng thái', 'Khách', 'SĐT', 'Email', 'Địa chỉ', 'Sản phẩm', 'Ảnh',
  'Tạm tính', 'Ship', 'Tổng', 'Ghi chú', 'In khung', 'Cập nhật', 'Tháng'];
const COT = { MA: 1, NGAY: 2, TRANG_THAI: 3, SDT: 5, TAM_TINH: 10, TONG: 12, CAP_NHAT: 15, THANG: 16 };

const thuocTinh = () => PropertiesService.getScriptProperties();
const tien = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Kinie')
    .addItem('Cài đặt / sửa lỗi', 'caiDat')
    .addItem('Xem mã bí mật', 'xemMaBiMat')
    .addToUi();
}

// Tạo tab, cột, danh sách trạng thái, tab Thống kê, trigger khi sửa, mã bí mật. Chạy lại bao nhiêu lần cũng được.
function caiDat() {
  const ss = SpreadsheetApp.getActive();
  const p = thuocTinh();
  if (!p.getProperty('SECRET')) p.setProperty('SECRET', (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''));
  if (!p.getProperty('NOTIFY_EMAIL')) p.setProperty('NOTIFY_EMAIL', Session.getEffectiveUser().getEmail());

  const sh = tabDon(ss);
  sh.getRange(1, 1, 1, TIEU_DE.length).setValues([TIEU_DE]).setFontWeight('bold').setBackground('#f6cfdb');
  sh.setFrozenRows(1);
  sh.setFrozenColumns(1);
  sh.getRange(1, COT.TRANG_THAI).setNote('Đổi trạng thái ở đây, web /admin tự cập nhật theo. Các cột khác do web ghi.');
  if (sh.getLastRow() > 1) dinhDangDong(sh, 2, sh.getLastRow() - 1);
  taoThongKe(ss);

  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'khiSua')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('khiSua').forSpreadsheet(ss).onEdit().create();

  // Không mở hộp thoại ở đây: hộp thoại hiện bên tab Sheet, chạy từ trình chỉnh sửa sẽ đứng chờ tới hết 6 phút.
  // Mã bí mật ghi vào Nhật ký thực thi; xem lại bằng menu Kinie > Xem mã bí mật.
  console.log('Đã cài xong. Mã bí mật (ORDERS_HOOK_SECRET): ' + p.getProperty('SECRET') +
    ' | Gmail báo đơn: ' + p.getProperty('NOTIFY_EMAIL'));
  ss.toast('Đã cài xong. Xem mã bí mật ở menu Kinie > Xem mã bí mật.', 'Kinie', 8);
}

function xemMaBiMat() {
  SpreadsheetApp.getUi().alert(
    'Mã bí mật – dán vào biến ORDERS_HOOK_SECRET trên Hostinger:\n\n' + thuocTinh().getProperty('SECRET') +
    '\n\nGmail báo đơn mới gửi tới: ' + thuocTinh().getProperty('NOTIFY_EMAIL') +
    '\n(đổi ở Project Settings > Script Properties > NOTIFY_EMAIL)');
}

function tabDon(ss) {
  return ss.getSheetByName(CAU_HINH.TAB_DON) || ss.insertSheet(CAU_HINH.TAB_DON, 0);
}

// Danh sách thả xuống ở cột Trạng thái, định dạng ngày, tiền, SĐT dạng chữ (giữ số 0 đầu).
function dinhDangDong(sh, dong, soDong) {
  const quyTac = SpreadsheetApp.newDataValidation().requireValueInList(CAU_HINH.TRANG_THAI, true).setAllowInvalid(false).build();
  sh.getRange(dong, COT.TRANG_THAI, soDong, 1).setDataValidation(quyTac);
  sh.getRange(dong, COT.NGAY, soDong, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange(dong, COT.CAP_NHAT, soDong, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange(dong, COT.SDT, soDong, 1).setNumberFormat('@');
  sh.getRange(dong, COT.TAM_TINH, soDong, 3).setNumberFormat('#,##0"đ"');
}

// ---------- web -> Sheet ----------
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return traVe({ ok: false, error: 'Dữ liệu không phải JSON' }); }
  if (!body.secret || body.secret !== thuocTinh().getProperty('SECRET')) return traVe({ ok: false, error: 'Sai mã bí mật' });

  const khoa = LockService.getScriptLock();
  khoa.waitLock(20000);
  try {
    const ds = body.orders || (body.order ? [body.order] : []);
    ghiDon(tabDon(SpreadsheetApp.getActive()), ds);
    if (body.event === 'new' && body.order) baoDonMoi(body.order);
    return traVe({ ok: true, count: ds.length });
  } catch (err) {
    return traVe({ ok: false, error: String(err.message || err) });
  } finally {
    khoa.releaseLock();
  }
}

function traVe(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Thêm hoặc sửa dòng theo mã đơn. Đơn mới nhất nằm trên cùng (ngay dưới dòng tiêu đề).
function ghiDon(sh, ds) {
  if (!ds.length) return;
  const cuoi = sh.getLastRow();
  const maCo = cuoi > 1 ? sh.getRange(2, COT.MA, cuoi - 1, 1).getValues().map((r) => String(r[0])) : [];
  const moi = [];
  ds.forEach((o) => {
    const giaTri = dongCua(o);
    const i = maCo.indexOf(o.code);
    if (i >= 0) {
      sh.getRange(i + 2, 1, 1, giaTri.length).setValues([giaTri]);
    } else {
      moi.push(giaTri);
    }
  });
  if (!moi.length) return;
  // Đồng bộ toàn bộ: web gửi đơn mới nhất trước, giữ đúng thứ tự đó.
  // Định dạng trước rồi mới ghi, để SĐT giữ số 0 đầu.
  sh.insertRowsBefore(2, moi.length);
  sh.getRange(2, 1, moi.length, TIEU_DE.length).setBackground(null).setFontWeight('normal');
  dinhDangDong(sh, 2, moi.length);
  sh.getRange(2, 1, moi.length, TIEU_DE.length).setValues(moi);
}

function dongCua(o) {
  const ngay = new Date(o.createdAt);
  return [
    o.code, ngay, o.status, o.name, String(o.phone || ''), o.email || '', o.address || '', o.items || '', o.photos || '',
    Number(o.subtotal) || 0, Number(o.shipping) || 0, Number(o.total) || 0, o.note || '', o.printUrl || '',
    new Date(), Utilities.formatDate(ngay, CAU_HINH.MUI_GIO, 'yyyy-MM'),
  ];
}

function baoDonMoi(o) {
  const den = thuocTinh().getProperty('NOTIFY_EMAIL');
  if (!den) return;
  const noiDung = [
    'Đơn mới trên kinie.online – chờ chuyển khoản.',
    '',
    'Mã đơn: ' + o.code + ' (nội dung chuyển khoản)',
    'Khách: ' + o.name + ' – ' + o.phone,
    'Địa chỉ: ' + o.address,
    'Sản phẩm: ' + o.items,
    'Ảnh: ' + o.photos,
    'Tổng: ' + tien(o.total) + (o.shipping ? ' (gồm ship ' + tien(o.shipping) + ')' : ' (free ship)'),
    o.note ? 'Ghi chú: ' + o.note : '',
    '',
    'Khi tiền về, đổi Trạng thái trên Sheet thành "Đã nhận tiền":',
    SpreadsheetApp.getActive().getUrl(),
    'In khung A4: ' + o.printUrl,
  ].filter((d, i, a) => d !== '' || a[i - 1] !== '').join('\n');
  MailApp.sendEmail(den, 'Kinie – đơn mới ' + o.code + ' – ' + tien(o.total), noiDung);
}

// ---------- Sheet -> web ----------
// Trigger "khi sửa" (do caiDat tạo). Chỉ chạy khi người sửa tay; script tự ghi thì không chạy, nên không bị lặp.
function khiSua(e) {
  const vung = e.range;
  const sh = vung.getSheet();
  if (sh.getName() !== CAU_HINH.TAB_DON) return;
  if (vung.getColumn() > COT.TRANG_THAI || vung.getLastColumn() < COT.TRANG_THAI || vung.getLastRow() < 2) return;

  const dau = Math.max(2, vung.getRow());
  const soDong = vung.getLastRow() - dau + 1;
  const ma = sh.getRange(dau, COT.MA, soDong, 1).getValues();
  const trangThai = sh.getRange(dau, COT.TRANG_THAI, soDong, 1).getValues();
  const motO = vung.getNumRows() === 1 && vung.getNumColumns() === 1;
  const p = thuocTinh();

  for (let k = 0; k < soDong; k++) {
    const code = String(ma[k][0]).trim();
    const status = String(trangThai[k][0]).trim();
    if (!code || !status) continue;
    const o = sh.getRange(dau + k, COT.TRANG_THAI);
    let loi = '';
    try {
      const res = UrlFetchApp.fetch(CAU_HINH.WEB_URL + '/api/sheet/status', {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        payload: JSON.stringify({ secret: p.getProperty('SECRET'), code: code, status: status }),
      });
      let d = {};
      try { d = JSON.parse(res.getContentText()); } catch (err) { d = { error: 'web trả về HTTP ' + res.getResponseCode() }; }
      if (res.getResponseCode() !== 200 || !d.ok) loi = d.error || ('HTTP ' + res.getResponseCode());
    } catch (err) {
      loi = String(err.message || err);
    }
    if (!loi) {
      o.setNote('');
      sh.getRange(dau + k, COT.CAP_NHAT).setValue(new Date());
    } else {
      if (motO && e.oldValue !== undefined) o.setValue(e.oldValue);
      o.setNote('Chưa cập nhật lên web: ' + loi + '. Chọn lại trạng thái để thử lại.');
    }
  }
}

// ---------- tab Thống kê (công thức, tự cập nhật) ----------
function taoThongKe(ss) {
  const sh = ss.getSheetByName(CAU_HINH.TAB_THONG_KE) || ss.insertSheet(CAU_HINH.TAB_THONG_KE);
  sh.clear();
  const D = "'" + CAU_HINH.TAB_DON + "'!";
  // Dấu ngăn tham số theo ngôn ngữ của Sheet: tiếng Việt (vi_VN) và các nước dùng dấu phẩy thập phân dùng ";".
  const S = /^(en|ja|zh|ko|th|he|hi|ms|fil)/.test(ss.getSpreadsheetLocale()) ? ',' : ';';
  const cho = '"' + CAU_HINH.CHO_THANH_TOAN + '"', huy = '"' + CAU_HINH.DA_HUY + '"';
  const loc = "A is not null and C <> '" + CAU_HINH.CHO_THANH_TOAN + "' and C <> '" + CAU_HINH.DA_HUY + "'";
  sh.getRange('A1').setValue('Thống kê đơn hàng Kinie (tự tính từ tab Đơn hàng; doanh thu không gồm đơn chờ chuyển khoản và đơn đã huỷ)')
    .setFontWeight('bold');
  const tong = [
    ['Tổng số đơn', '=COUNTA(' + D + 'A2:A)'],
    ['Đơn chờ chuyển khoản', '=COUNTIF(' + D + 'C2:C' + S + cho + ')'],
    ['Tiền đang chờ chuyển khoản', '=SUMIF(' + D + 'C2:C' + S + cho + S + D + 'L2:L)'],
    ['Đơn đã huỷ', '=COUNTIF(' + D + 'C2:C' + S + huy + ')'],
    ['Doanh thu đã nhận tiền', '=SUM(' + D + 'L2:L)-SUMIF(' + D + 'C2:C' + S + cho + S + D + 'L2:L)-SUMIF(' + D + 'C2:C' + S + huy + S + D + 'L2:L)'],
  ];
  sh.getRange(3, 1, tong.length, 1).setValues(tong.map((r) => [r[0]]));
  sh.getRange(3, 2, tong.length, 1).setFormulas(tong.map((r) => [r[1]]));
  sh.getRange('B5').setNumberFormat('#,##0"đ"');
  sh.getRange('B7').setNumberFormat('#,##0"đ"');

  sh.getRange('A10').setValue('Theo tháng').setFontWeight('bold');
  // Dấu phẩy bên trong chuỗi truy vấn QUERY giữ nguyên; chỉ dấu ngăn tham số đổi theo S.
  const rong = '"Chưa có đơn đã nhận tiền"';
  sh.getRange('A11').setFormula('=IFERROR(QUERY(' + D + 'A2:P' + S + '"select P, count(A), sum(L) where ' + loc +
    " group by P order by P desc label P 'Tháng', count(A) 'Số đơn', sum(L) 'Doanh thu'\"" + S + '0)' + S + rong + ')');
  sh.getRange('E10').setValue('Theo sản phẩm').setFontWeight('bold');
  sh.getRange('E11').setFormula('=IFERROR(QUERY(' + D + 'A2:P' + S + '"select H, count(A), sum(L) where ' + loc +
    " group by H order by count(A) desc label H 'Sản phẩm', count(A) 'Số đơn', sum(L) 'Doanh thu'\"" + S + '0)' + S + rong + ')');
  sh.getRange('C11:C').setNumberFormat('#,##0"đ"');
  sh.getRange('G11:G').setNumberFormat('#,##0"đ"');
  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(5, 260);
}
