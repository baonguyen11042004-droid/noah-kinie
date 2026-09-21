// Bảng giá thật của shop: một sản phẩm duy nhất là ảnh nam châm 6,5 x 8 cm, dày 3 mm, tính giá theo số ảnh.
// Mỗi dòng là một gói (qty = số ảnh). Sau khi chạy lần đầu, dữ liệu được lưu vào data/db.json và sửa qua /admin.
// "image" để trống -> site tự vẽ ảnh minh hoạ; điền URL/đường dẫn (vd /img/abc.jpg) để dùng ảnh thật.
// Giá tính bằng đồng: 29000 = 29k.
const tier = (qty, category, price, oldPrice, extra = {}) => ({
  id: 'p' + qty, slug: 'anh-nam-cham-' + qty + '-anh', name: 'Ảnh nam châm – ' + qty + ' ảnh',
  category, qty, price, oldPrice, gift: 0, freeship: false, hot: false, stock: 999, featured: false,
  hue: 340 + (qty % 7) * 6, image: '', ...extra,
});

module.exports = [
  // Ảnh lẻ
  tier(1, 'le', 29000, 0),
  tier(3, 'le', 74000, 87000),
  tier(6, 'le', 119000, 174000, { hot: true, featured: true }),
  // Combo tiết kiệm
  tier(9, 'combo', 179000, 261000),
  tier(15, 'combo', 279000, 435000),
  tier(20, 'combo', 379000, 580000, { hot: true, freeship: true, featured: true }),
  // Combo gia đình
  tier(29, 'gia-dinh', 549000, 841000, { gift: 1, freeship: true }),
  tier(50, 'gia-dinh', 929000, 1421000, { gift: 2, hot: true, freeship: true, featured: true }),
  tier(100, 'gia-dinh', 1899000, 2900000, { gift: 3, hot: true, freeship: true }),
  tier(200, 'gia-dinh', 3799000, 5800000, { gift: 5, hot: true, freeship: true }),
];
