// Sản phẩm mẫu. Sau khi chạy lần đầu, dữ liệu được lưu vào data/db.json và sửa qua /admin.
// "image" để trống -> site tự vẽ ảnh minh hoạ; điền URL/đường dẫn (vd /img/abc.jpg) để dùng ảnh thật.
module.exports = [
  {
    id: 'polaroid-6', slug: 'polaroid-magnet-set-6', name: 'Polaroid Magnet – Set 6 ảnh',
    category: 'polaroid', price: 129000, oldPrice: 159000, stock: 100, featured: true,
    tag: 'Bán chạy', hue: 350, image: '',
    short: 'Ảnh khung polaroid viền trắng, gắn nam châm mỏng nhẹ.',
    description: 'Ảnh in trên giấy ảnh cao cấp, ép plastic bóng chống nước, khung polaroid viền trắng kinh điển. Mặt sau gắn nam châm dẻo bám chắc tủ lạnh, bảng từ. Kích thước 7.6 x 8.8 cm. Bạn chỉ cần gửi 6 ảnh, Kinie sẽ căn chỉnh và cắt bo giúp.',
    specs: ['Kích thước 7.6 x 8.8 cm', 'Giấy ảnh cao cấp + ép bóng', 'Nam châm dẻo mặt sau', 'Set 6 ảnh'],
  },
  {
    id: 'square-9', slug: 'magnet-vuong-set-9', name: 'Magnet vuông Mini – Set 9 ảnh',
    category: 'vuong', price: 149000, oldPrice: 0, stock: 100, featured: true,
    tag: 'Mới', hue: 20, image: '',
    short: 'Ảnh vuông 5x5 cm, ghép thành bức tường ảnh mini trên tủ lạnh.',
    description: 'Chín khung ảnh vuông 5 x 5 cm ghép thành lưới, rất hợp để kể một câu chuyện nhỏ trên tủ lạnh. In màu sắc nét, bề mặt bóng hoặc mờ tuỳ chọn.',
    specs: ['Kích thước 5 x 5 cm', 'Bề mặt bóng hoặc mờ', 'Set 9 ảnh'],
  },
  {
    id: 'round-4', slug: 'magnet-tron-set-4', name: 'Magnet tròn Vintage – Set 4 ảnh',
    category: 'tron', price: 99000, oldPrice: 0, stock: 100, featured: true,
    tag: '', hue: 30, image: '',
    short: 'Ảnh bo tròn tone film, cảm giác hoài niệm.',
    description: 'Ảnh cắt tròn đường kính 6 cm, có thể thêm filter tone film ấm theo yêu cầu. Nhỏ xinh, đặt cạnh nhau tạo hiệu ứng như những chiếc huy hiệu kỷ niệm.',
    specs: ['Đường kính 6 cm', 'Tuỳ chọn filter film', 'Set 4 ảnh'],
  },
  {
    id: 'acrylic-3', slug: 'magnet-acrylic-trong-suot-set-3', name: 'Magnet Acrylic trong suốt – Set 3',
    category: 'acrylic', price: 189000, oldPrice: 219000, stock: 60, featured: true,
    tag: 'Cao cấp', hue: 200, image: '',
    short: 'Mica trong suốt dày 3mm, ảnh nổi như lơ lửng.',
    description: 'Ảnh in trực tiếp lên mica trong suốt 3 mm, cạnh bo mịn, nam châm âm bên trong. Sang, bền, không phai màu. Kích thước 6 x 8 cm.',
    specs: ['Mica 3 mm', 'In UV bền màu', 'Kích thước 6 x 8 cm', 'Set 3 ảnh'],
  },
  {
    id: 'strip-2', slug: 'magnet-strip-3-khung', name: 'Photo Strip Magnet – 2 dải',
    category: 'polaroid', price: 89000, oldPrice: 0, stock: 100, featured: false,
    tag: '', hue: 340, image: '',
    short: 'Dải ảnh 3 khung kiểu photobooth.',
    description: 'Dải ảnh dọc 3 khung theo phong cách photobooth, kích thước 4.5 x 14 cm. Mỗi dải là một câu chuyện ba khoảnh khắc.',
    specs: ['Kích thước 4.5 x 14 cm', '3 khung / dải', 'Set 2 dải'],
  },
  {
    id: 'gift-box', slug: 'hop-qua-tang-kinie', name: 'Hộp quà Kinie – 12 ảnh',
    category: 'qua-tang', price: 299000, oldPrice: 349000, stock: 40, featured: true,
    tag: 'Quà tặng', hue: 10, image: '',
    short: 'Hộp quà kèm thiệp viết tay, mix nhiều kiểu magnet.',
    description: 'Hộp giấy kraft cứng cáp gồm 12 ảnh mix polaroid, vuông và tròn, kèm thiệp viết tay và ruy băng. Món quà sinh nhật, kỷ niệm, valentine được yêu thích nhất.',
    specs: ['12 ảnh mix kiểu', 'Hộp kraft + thiệp viết tay', 'Gói quà miễn phí'],
  },
];
