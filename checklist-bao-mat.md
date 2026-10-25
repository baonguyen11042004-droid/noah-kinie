# Checklist bảo mật – Web kinie

Dùng mỗi khi sửa `server.js`, `lib/`, `views/`, `apps-script/` hoặc trước khi đưa bản mới lên Hostinger.
Dựa trên 7 nguyên tắc bảo mật khi code (theo OWASP Secure Coding Practices). Soát lần đầu 25/10/2026.

| # | Nguyên tắc | Ở web kinie làm thế nào | Trạng thái 25/10 |
|---|---|---|---|
| 1 | Không lộ khoá bí mật | Mật khẩu, mã phiên, SMTP, tài khoản ngân hàng, `ORDERS_HOOK_SECRET` chỉ nằm trong `.env` (đã có trong `.gitignore`) và biến môi trường Hostinger. Mã bí mật Apps Script nằm ở Script Properties. Không `console.log` khoá. | Đạt (đã vá: bỏ mật khẩu mặc định `admin123`, bỏ in mã bí mật ra nhật ký Apps Script) |
| 2 | Kiểm tra mọi đầu vào ở server | Mọi trường form qua `str(v, max)` cắt độ dài; SĐT, email kiểm bằng regex; số lượng, giá qua `parseInt` + `Math.max`; ảnh tải lên kiểm là JPEG thật, ≤ 3 MB; body form ≤ 50 KB. | Đạt |
| 3 | Chặn SQL injection | Web lưu bằng file JSON (`data/db.json`), không có SQL. Nếu sau này đổi sang cơ sở dữ liệu: chỉ dùng truy vấn có tham số. | Không áp dụng |
| 4 | Chặn XSS | Trong EJS chỉ dùng `<%= %>` (tự mã hoá) cho dữ liệu. `<%- %>` chỉ dùng cho `include` và JSON-LD (đã thay `<` thành `<`). Helmet bật CSP, chỉ cho script từ chính web và TikTok Pixel. | Đạt |
| 5 | Kiểm tra quyền từng request | Mọi route `/admin/*` có `requireAdmin`; mọi form có `checkCsrf`; ảnh khách chỉ xem được bởi đúng giỏ hàng (`lineOf`) hoặc admin; link đơn hàng cần khoá ngẫu nhiên; API Sheet cần mã bí mật (so sánh thời gian hằng). | Đạt |
| 6 | Bảo vệ mật khẩu | Web chưa có tài khoản khách. Mật khẩu admin là biến môi trường, so sánh bằng `timingSafeEqual`, đăng nhập giới hạn 10 lần/15 phút. Nếu sau này có tài khoản khách: băm bằng `bcrypt`/`argon2`, không tự chế. | Đạt |
| 7 | Kiểm tra trước khi bàn giao | Chạy `npm audit --omit=dev` (25/10: 0 lỗ hổng); chạy lệnh `/security-review` của Claude Code; thử vào `/admin` khi chưa đăng nhập phải bị đẩy về trang login. | Đạt |

## Trước khi đưa bản mới lên Hostinger
- [ ] Hostinger có đủ `NODE_ENV=production`, `SESSION_SECRET` (chuỗi ngẫu nhiên ≥ 30 ký tự), `ADMIN_PASSWORD` (không phải giá trị mẫu `doi-...`). Thiếu thì admin bị khoá và log báo "Thiếu ADMIN_PASSWORD".
- [ ] `npm audit --omit=dev` không có lỗ hổng mức high/critical.
- [ ] Không có khoá thật trong file nào ngoài `.env` (tìm `sk_`, `AIza`, `password=`).
- [ ] Route mới có `requireAdmin` (nếu là admin) và `checkCsrf` (nếu là POST).
- [ ] Dữ liệu khách (tên, SĐT, địa chỉ, ảnh) không ghi vào log, không gửi sang Sheet content.

## Không làm
- Không cài công cụ xoá dấu AI (watermarks-remover) để làm sạch ảnh sản phẩm tạo bằng AI.
