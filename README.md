# Nhật ký Kinie – website ảnh nam châm

Express + EJS, không cần bước build. Dữ liệu (sản phẩm, đơn hàng, tin nhắn) lưu trong `data/db.json`.

## Chạy local
```bash
npm install
copy .env.example .env      # rồi sửa các giá trị trong .env
npm start                   # http://localhost:3000
```
Trang quản trị: `/admin` (mật khẩu = `ADMIN_PASSWORD` trong `.env`). Ở đó bạn xem đơn, đổi trạng thái, thêm/sửa/xoá sản phẩm.

## Đẩy lên GitHub
```bash
git init
git add .
git commit -m "Kinie website"
git branch -M main
git remote add origin https://github.com/<user>/kinie.git
git push -u origin main
```
`.env` và `data/db.json` đã nằm trong `.gitignore` nên sẽ không bị đẩy lên.

## Deploy lên Hostinger
Cần gói có **Node.js Web Apps** (Business Web Hosting, Cloud, hoặc VPS).

1. hPanel → **Websites → Add website → Node.js Apps**.
2. Chọn **Import Git Repository**, kết nối GitHub và chọn repo `kinie`, branch `main`.
3. Cấu hình: Node version **20 hoặc 22**, Build command để trống, Start command `npm start`, entry file `server.js`.
4. Vào **Environment variables**, thêm các biến trong `.env.example`. Bắt buộc: `NODE_ENV=production`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `SITE_URL`, thông tin ngân hàng và liên hệ.
5. Bấm **Deploy**. Mỗi lần `git push`, Hostinger có thể tự deploy lại.
6. Trỏ tên miền và bật SSL trong hPanel.

### Lưu ý quan trọng
- `data/db.json` nằm trên ổ đĩa server. Khi deploy lại, file này thường được giữ nguyên nhưng **hãy sao lưu định kỳ** (tải qua File Manager).
- Cookie giỏ hàng dùng `secure` khi `NODE_ENV=production`, nên site phải chạy HTTPS.
- Muốn dùng ảnh thật: chép ảnh vào `public/img/`, rồi điền `/img/ten-anh.jpg` vào ô "Ảnh" của sản phẩm trong admin.
- Muốn nhận email khi có đơn: điền `SMTP_*` và `NOTIFY_TO`.
- Chạy thử trên máy (http://localhost) thì đặt `NODE_ENV=development`, nếu không giỏ hàng sẽ báo "Phiên hết hạn".

## SEO
- Bản tiếng Việt ở `/...`, bản tiếng Anh ở `/en/...`; mỗi trang có `canonical` và `hreflang` trỏ sang bản còn lại.
- `SITE_URL` phải là tên miền thật (vd `https://kinie.vn`): dùng cho canonical, `og:url`, `sitemap.xml`, `robots.txt`.
- Tiêu đề và mô tả từng trang nằm ở các khoá `seo*` / `desc*` trong `lib/i18n.js`; nội dung hỏi đáp ở khoá `faq`.
- Dữ liệu có cấu trúc (JSON-LD): `Store` (trang chủ, Về Kinie), `Product` (trang sản phẩm), `FAQPage` (`/hoi-dap`), `BreadcrumbList`.
- Giỏ hàng, thanh toán, admin, trang lỗi và các biến thể sắp xếp (`?sort=`) có `noindex`.
- Sau khi deploy: khai báo `https://<tên-miền>/sitemap.xml` trong Google Search Console, kiểm tra JSON-LD bằng Rich Results Test.
