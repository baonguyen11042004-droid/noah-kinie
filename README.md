# Kinie – website ảnh nam châm

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

## Đặt hàng: thêm ảnh vào khung, chuyển khoản trước
- Chọn combo → **Thêm ảnh vào khung** (`/gio-hang/anh/<mã>`) → thanh toán. Mỗi khung là vùng ảnh dọc 55 × 80 mm của khung in chuyên dụng ("Final Ảnh dọc"); trình duyệt cắt sẵn ảnh ở 300 dpi (650 × 945 px) rồi tải lên. Khách vẫn có thể chọn gửi ảnh qua Zalo.
- Ảnh lưu ở `data/uploads/<mã>/` trên ổ server (đã nằm trong `.gitignore`): **sao lưu cùng `data/db.json`**. Ảnh của giỏ hàng bỏ dở được tự xoá sau 3 ngày; ảnh của đơn hàng không tự xoá.
- Chỉ nhận chuyển khoản trước 100%. Trang đặt hàng thành công hiện mã QR VietQR có sẵn số tiền và mã đơn: cần đặt `BANK_ID` (mã ngân hàng VietQR, vd `VCB`, `MB`, `TCB`), `BANK_ACCOUNT`, `BANK_HOLDER`. Đơn mới ở trạng thái "Chờ thanh toán"; khi tiền về, đổi sang "Đã nhận tiền" trong `/admin`.
- In: trong `/admin`, bấm **In khung A4** ở từng đơn (6 tấm/tờ, đúng vị trí khung in). In tỉ lệ 100%, lề Không, bật In hình nền.

## Google Sheet đơn hàng + Gmail báo đơn (2 chiều)
Mã Apps Script: `apps-script/don-hang.gs`. Đơn mới và mỗi lần đổi trạng thái trong `/admin` được ghi vào Sheet; đơn mới gửi Gmail báo; đổi cột **Trạng thái** trên Sheet thì `/admin` đổi theo. Từ Sheet chỉ đổi được trạng thái. Sheet chứa thông tin khách và doanh thu: để riêng, chỉ CEO xem.
1. Mở Google Sheet "Khách trên web Kinie" (đã tạo sẵn tab Đơn hàng) → **Tiện ích mở rộng → Apps Script** → xoá mã mẫu, dán toàn bộ `apps-script/don-hang.gs` → Lưu.
2. Chọn hàm `caiDat` → **Chạy** → cấp quyền (Google hỏi quyền sửa Sheet, gửi mail, kết nối ra ngoài). Hộp thoại hiện **mã bí mật**.
3. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**: Thực thi với tư cách **Tôi**, Ai có quyền truy cập **Bất kỳ ai** → chép **URL ứng dụng web**.
4. Hostinger → Biến môi trường: `ORDERS_HOOK_URL` = URL ứng dụng web, `ORDERS_HOOK_SECRET` = mã bí mật → Áp dụng thay đổi.
5. Vào `/admin` → **Gửi lại tất cả đơn sang Sheet** (đưa đơn cũ sang, kiểm tra kết nối).
- Gmail báo đơn gửi tới tài khoản chạy script; đổi ở Apps Script → Project Settings → Script Properties → `NOTIFY_EMAIL`. Giới hạn của Google: 100 thư/ngày.
- Sửa `don-hang.gs` sau khi đã triển khai: **Triển khai → Quản lý bản triển khai → sửa → Phiên bản mới** (URL giữ nguyên).
- Chữ trạng thái trên Sheet phải trùng `STATUS` trong `server.js`.
- Chạy thử trên máy (http://localhost) thì đặt `NODE_ENV=development`, nếu không giỏ hàng sẽ báo "Phiên hết hạn".

## SEO
- Bản tiếng Việt ở `/...`, bản tiếng Anh ở `/en/...`; mỗi trang có `canonical` và `hreflang` trỏ sang bản còn lại.
- `SITE_URL` phải là tên miền thật (vd `https://kinie.vn`): dùng cho canonical, `og:url`, `sitemap.xml`, `robots.txt`.
- Tiêu đề và mô tả từng trang nằm ở các khoá `seo*` / `desc*` trong `lib/i18n.js`; nội dung hỏi đáp ở khoá `faq`.
- Dữ liệu có cấu trúc (JSON-LD): `Store` (trang chủ, Về Kinie), `Product` (trang sản phẩm), `FAQPage` (`/hoi-dap`), `BreadcrumbList`.
- Giỏ hàng, thanh toán, admin, trang lỗi và các biến thể sắp xếp (`?sort=`) có `noindex`.
- Trang theo dịp (`data/landings.js`), blog (`data/blog.js`) và đánh giá (`data/reviews.js`) chỉ có bản tiếng Việt; `/en/...` của chúng chuyển về bản VI. Từ khoá từng trang theo `seo/SS8-Kinie-Keyword-Map-kinie.online-v4.xlsx`.
- Đánh giá: chỉ thêm đánh giá thật vào `data/reviews.js`. Khi còn trống, `/danh-gia` để noindex và không nằm trong sitemap.
- Khi `NODE_ENV=production` mà chưa đặt `SITE_URL`, site tự dùng `https://kinie.online`.
- Sau khi deploy: khai báo `https://<tên-miền>/sitemap.xml` trong Google Search Console, kiểm tra JSON-LD bằng Rich Results Test.
