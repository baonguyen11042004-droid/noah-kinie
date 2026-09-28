// Chữ hiển thị song ngữ. Tiếng Việt là bản gốc; tiếng Anh giữ giọng thân thiện, ngôi thứ nhất, ngắn gọn.
// Giá trị là chuỗi hoặc hàm (khi có tham số). Khu quản trị (/admin) vẫn dùng tiếng Việt.
const dict = {
  vi: {
    langName: 'VI', htmlLang: 'vi',
    metaDesc: 'Nhật ký Kinie – ảnh nam châm handmade 6,5 × 8 cm cho tủ lạnh. Gửi ảnh qua Zalo, Kinie tư vấn và báo giá ngay.',
    homeTitle: 'Ảnh nam châm handmade',

    // SEO: tiêu đề + mô tả riêng cho từng trang (từ khoá chính: "ảnh nam châm tủ lạnh", "in ảnh nam châm")
    seoHome: 'In ảnh nam châm tủ lạnh handmade từ 29k',
    seoPrice: 'Bảng giá in ảnh nam châm tủ lạnh – từ 1 đến 200 ảnh',
    seoShop: 'Ảnh nam châm tủ lạnh 6,5 × 8 cm',
    seoShopCat: (c) => c + ' – ảnh nam châm tủ lạnh',
    seoProduct: (n) => (n === 1 ? 'In 1 ảnh' : 'Combo ' + n + ' ảnh') + ' nam châm tủ lạnh',
    seoAbout: 'Về Kinie – ảnh nam châm làm tay từng chiếc',
    seoContact: 'Liên hệ in ảnh nam châm qua Zalo',
    seoFaq: 'Hỏi đáp về ảnh nam châm tủ lạnh',
    descHome: 'In ảnh nam châm tủ lạnh 6,5 × 8 cm handmade từ 29k/ảnh: in 6 màu, 5 lớp chống nước, nam châm dày 3 mm. Gửi ảnh qua Zalo, giao tận nơi 2–4 ngày.',
    descPrice: 'Bảng giá ảnh nam châm tủ lạnh Kinie từ 1 đến 200 ảnh: ảnh lẻ, combo tiết kiệm, combo gia đình. Càng nhiều ảnh càng rẻ, free ship từ combo 20 ảnh.',
    descShop: 'Chọn combo ảnh nam châm tủ lạnh 6,5 × 8 cm: ảnh lẻ, combo tiết kiệm, combo gia đình. In 6 màu, chống nước, làm thủ công – đặt online hoặc nhắn Zalo.',
    descShopCat: (c) => c + ' ảnh nam châm tủ lạnh 6,5 × 8 cm của Nhật ký Kinie. In 6 màu, 5 lớp chống nước, nam châm dày 3 mm – đặt online hoặc nhắn Zalo.',
    descProduct: (p, price) => (p.qty === 1 ? '1 ảnh' : 'Combo ' + p.qty + ' ảnh') + ' nam châm tủ lạnh 6,5 × 8 cm giá ' + price +
      (p.gift ? ', tặng ' + p.gift + ' ảnh' : '') + (p.freeship ? ', free ship' : '') + '. In 6 màu, 5 lớp chống nước, nam châm dày 3 mm, làm thủ công.',
    descAbout: 'Câu chuyện Nhật ký Kinie: ảnh nam châm tủ lạnh handmade, in 6 màu, phủ 5 lớp bảo vệ, cắt và gắn nam châm thủ công từng chiếc – món quà kỷ niệm xinh xắn.',
    descContact: 'Liên hệ Nhật ký Kinie để in ảnh nam châm tủ lạnh: nhắn Zalo, gọi điện hoặc gửi tin nhắn – Kinie tư vấn và báo giá ngay.',
    descFaq: 'Giải đáp về ảnh nam châm tủ lạnh Kinie: kích thước, độ bền, chống nước, cách gửi ảnh, thời gian giao hàng, phí ship và thanh toán.',
    prodAlt: (p) => (p.qty === 1 ? '1 ảnh' : 'Combo ' + p.qty + ' ảnh') + ' nam châm tủ lạnh 6,5 × 8 cm – Nhật ký Kinie',
    ogLocale: 'vi_VN',

    // nav + chung
    home: 'Trang chủ', price: 'Bảng giá', magnets: 'Ảnh nam châm', about: 'Về Kinie', contact: 'Liên hệ', cart: 'Giỏ hàng',
    skip: 'Bỏ qua điều hướng', darkTo: 'Chuyển sang giao diện tối', lightTo: 'Chuyển sang giao diện sáng', menuOpen: 'Mở menu',
    langLabel: 'Ngôn ngữ', homeAria: 'Nhật ký Kinie – trang chủ', cartAria: 'Giỏ hàng', mainMenu: 'Menu chính',
    zalo: 'Zalo', zaloCta: 'Nhắn Zalo', zaloLong: 'Nhắn Zalo để tư vấn',
    photos: (n) => n + ' ảnh', comboOf: (n) => 'Ảnh nam châm – ' + n + ' ảnh',
    hot: 'Bán chạy', freeship: 'Free ship', gift: (n) => 'Tặng ' + n + ' ảnh', perPhoto: 'k/ảnh',
    addToCart: 'Thêm vào giỏ', buyNow: 'Mua ngay', soldOut: 'Hết hàng', qtyLabel: 'Số lượng', viewAll: 'Xem tất cả →',

    // trang chủ
    handmadeBadge: 'Handmade tại Việt Nam · làm tay từng chiếc',
    heroTitle1: 'Kinie ghi lại,', heroTitle2: 'bạn nhớ mãi.',
    heroBody: 'Ảnh nam châm 6,5 × 8 cm cho tủ lạnh của bạn. Gửi ảnh qua Zalo, Kinie tư vấn và báo giá ngay – bạn không phải chọn kiểu hay tính toán gì cả.',
    heroCta: 'Gửi ảnh làm magnet', ribbon: 'Thủ công 100%', yourPhoto: 'Ảnh của bạn', mascotAlt: 'Linh vật Kinie cầm những tấm ảnh',
    stats: [['6,5 × 8 cm', 'kích thước'], ['3 mm', 'độ dày ảnh'], ['29k', 'từ mỗi ảnh']],
    feat: [
      ['Ảnh HD/4K', 'Công nghệ in 6 màu hiện đại, màu sắc rạng rỡ, chân thực.'],
      ['Độ bền', '5 lớp bảo vệ cao cấp, chống nước, chống trầy xước, độ bóng cao.'],
      ['Độ hít bám', 'Nam châm dày, dẻo, bám tốt trên tủ lạnh, cửa sổ, mọi bề mặt từ tính.'],
    ],
    quickEyebrow: 'Được yêu thích', quickTitle: 'Đặt nhanh', quickSub: 'Ba combo được đặt nhiều nhất ở Kinie.',
    cardSubs: ['Bộ nhỏ cho một góc tủ lạnh', 'Free ship toàn quốc', 'Tặng 2 ảnh + free ship'],
    family: 'Gia đình',
    otherQtyTitle: 'Số lượng khác?', otherQtyBody: 'Xem đầy đủ bảng giá từ 1 đến 200 ảnh.', openPrice: 'Mở bảng giá',
    stepsEyebrow: 'Quy trình', stepsTitle: 'Từ tấm ảnh đến chiếc magnet',
    steps: [
      ['Chọn số ảnh', 'Chọn combo hợp với bạn, càng nhiều ảnh càng tiết kiệm.'],
      ['Gửi ảnh', 'Gửi ảnh qua Zalo hoặc link Google Drive, Kinie chỉnh màu và căn khung.'],
      ['In & hoàn thiện', 'In 6 màu, phủ 5 lớp bảo vệ, cắt và dán nam châm thủ công.'],
      ['Nhận hàng', 'Đóng gói cẩn thận, giao tận nơi trong 2–4 ngày.'],
    ],
    quotesEyebrow: 'Lời khen', quotesTitle: 'Khách hàng nói gì',
    quotes: [
      ['Ảnh lên màu rất đẹp, nam châm bám chắc. Mình tặng cả nhóm bạn thân, ai cũng mê!', 'Ngọc Anh'],
      ['Đóng gói xinh xỉu, Kinie nhắn Zalo tư vấn rất nhiệt tình.', 'Minh Quân'],
      ['Nam châm dày, in ra màu y như ảnh gốc. Sẽ ủng hộ tiếp.', 'Thu Hà'],
    ],
    ctaTitle: 'Có ảnh muốn in?', ctaBody: 'Nhắn Kinie qua Zalo, mình tư vấn và báo giá ngay.',

    // bảng giá
    priceEyebrow: 'Bảng giá', priceTitle: 'Bảng giá Kinie',
    priceSub: 'Giá đã gồm ảnh in, nam châm dày 3 mm và keo nano acrylic siêu chắc.',
    tabs: { le: 'Ảnh lẻ', combo: 'Combo tiết kiệm', 'gia-dinh': 'Combo gia đình' },
    specs: [['Kích thước', '6,5 × 8 cm'], ['Độ dày ảnh', '3 mm'], ['Quà tặng đính kèm', 'Keo nano acrylic']],
    tip: 'Mẹo của Kinie', tipBody: 'Chưa chắc chọn combo nào? Gửi hết ảnh qua Zalo, mình xếp giúp bạn.',
    singlePrice: (k) => k + '/ảnh',

    // cửa hàng + sản phẩm
    shopEyebrow: 'Ảnh nam châm', shopTitle: 'Ảnh nam châm 6,5 × 8 cm', all: 'Tất cả', sort: 'Sắp xếp',
    sortDefault: 'Mặc định', sortAsc: 'Giá tăng dần', sortDesc: 'Giá giảm dần', emptyCat: 'Chưa có sản phẩm trong mục này.',
    crumbHome: 'Trang chủ', prodBody: 'Giấy ảnh cao cấp, 5 lớp phủ bảo vệ, nam châm dẻo dày 3 mm. Mỗi chiếc được Kinie cắt và dán tay.',
    prodNote: 'Sau khi đặt hàng, Kinie sẽ liên hệ để nhận ảnh của bạn qua Zalo hoặc link Google Drive.',
    detailTitle: 'Chi tiết sản phẩm',
    detailFeat: [
      ['In 6 màu', 'Màu rạng rỡ, chân thực, không lệch tone da.'],
      ['Chống nước', '5 lớp phủ, lau được bằng khăn ẩm.'],
      ['Làm thủ công', 'Kinie cắt, dán và kiểm tay từng chiếc.'],
    ],
    approx: (u, n) => '≈ ' + u + 'k/ảnh · combo ' + n + ' ảnh', related: 'Có thể bạn thích',
    specList: (p) => ['Kích thước 6,5 × 8 cm, dày 3 mm', 'In 6 màu, 5 lớp phủ bảo vệ', 'Nam châm dẻo, bám chắc tủ lạnh', p.qty + ' ảnh' + (p.gift ? ' + tặng ' + p.gift + ' ảnh' : '')],

    // giỏ hàng + thanh toán
    cartTitle: 'Giỏ hàng', cartEmpty: 'Giỏ hàng đang trống.', shopNow: 'Chọn combo', update: 'Cập nhật',
    subtotal: 'Tạm tính', shipping: 'Phí vận chuyển', free: 'Miễn phí',
    freeshipHint: (m) => 'Mua thêm ' + m + ' để được free ship.', totalFull: 'Tổng cộng', checkoutGo: 'Tiến hành thanh toán',
    checkoutTitle: 'Thanh toán', fName: 'Họ và tên', fPhone: 'Số điện thoại (Zalo)', fEmail: 'Email (không bắt buộc)',
    fAddress: 'Địa chỉ nhận hàng', fNote: 'Ghi chú (link ảnh Google Drive, yêu cầu riêng…)', payMethod: 'Phương thức thanh toán',
    payCod: 'Thanh toán khi nhận hàng (COD)', payBank: 'Chuyển khoản ngân hàng', placeOrder: 'Đặt hàng',
    yourOrder: 'Đơn hàng của bạn', shipShort: 'Vận chuyển', total: 'Tổng',
    thanksTitle: 'Cảm ơn bạn đã đặt hàng!',
    thanksBody: (code, phone) => ['Mã đơn của bạn: ', code, '. Kinie sẽ nhắn Zalo qua số ', phone, ' để xác nhận và nhận ảnh trong 15 phút.'],
    bankInfo: 'Thông tin chuyển khoản', bankName: 'Ngân hàng', bankAcc: 'Số tài khoản', bankHolder: 'Chủ tài khoản', amount: 'Số tiền', content: 'Nội dung',
    keepShopping: 'Tiếp tục chọn combo', successTitle: 'Đặt hàng thành công',

    // về + liên hệ
    aboutEyebrow: 'Về Kinie', aboutTitle: 'Những khoảnh khắc nhỏ xứng đáng được nhìn thấy mỗi ngày',
    aboutP1: 'Nhật ký Kinie bắt đầu từ một chiếc tủ lạnh trống trơn và một xấp ảnh chưa biết để đâu. Chúng mình tin rằng ảnh đẹp nhất là ảnh được đặt ở nơi ta nhìn thấy mỗi sáng.',
    aboutP2: 'Mỗi chiếc ảnh nam châm của Kinie được in 6 màu, phủ 5 lớp bảo vệ, cắt và gắn nam châm thủ công – từng chi tiết đều được kiểm tra trước khi đóng gói.',
    aboutList: ['Chất liệu bền màu, chống nước, không bong tróc', 'Nam châm dày 3 mm, bám chắc, không làm xước bề mặt', 'Làm tay từng chiếc, làm quà tặng rất hợp'],
    aboutCta: 'Xem bảng giá', aboutAlt: 'Ảnh nam châm Nhật ký Kinie',
    contactTitle: 'Kể Kinie nghe ý tưởng của bạn', fMsgName: 'Tên', fMsgEmail: 'Email', fMsg: 'Tin nhắn', send: 'Gửi tin nhắn',
    contactThanks: 'Cảm ơn bạn! Kinie đã nhận tin nhắn và sẽ phản hồi sớm.', quick: 'Hoặc nhắn nhanh:',

    // hỏi đáp (FAQ)
    faqNav: 'Hỏi đáp', faqEyebrow: 'Hỏi đáp', faqTitle: 'Câu hỏi thường gặp về ảnh nam châm',
    faqSub: 'Những điều khách hay hỏi Kinie trước khi đặt in. Chưa thấy câu trả lời? Nhắn Zalo cho mình nhé.',
    faqLink: 'Câu hỏi thường gặp →', faqMore: 'Còn thắc mắc?',
    faq: (minPrice, freeShip, shipFee) => [
      ['Ảnh nam châm của Kinie có kích thước bao nhiêu?', 'Mỗi ảnh nam châm có kích thước 6,5 × 8 cm và dày 3 mm – vừa vặn trên tủ lạnh, cửa sổ hay bảng từ.'],
      ['Ảnh nam châm có chống nước, có bền màu không?', 'Có. Ảnh được in 6 màu và phủ 5 lớp bảo vệ nên chống nước, chống trầy xước và bền màu. Khi bẩn, bạn chỉ cần lau bằng khăn ẩm.'],
      ['Nam châm có bám chắc, có làm xước tủ lạnh không?', 'Nam châm dẻo dày 3 mm bám chắc trên tủ lạnh, cửa sổ và mọi bề mặt có từ tính, không làm xước bề mặt.'],
      ['In ảnh nam châm giá bao nhiêu?', 'Ảnh lẻ từ ' + minPrice + '/ảnh. Kinie có các gói từ 1 đến 200 ảnh – càng nhiều ảnh, giá mỗi ảnh càng rẻ. Xem chi tiết ở trang Bảng giá.'],
      ['Mình chưa biết nên chọn combo nào?', 'Cứ gửi hết ảnh qua Zalo, Kinie tư vấn combo phù hợp và báo giá ngay – bạn không phải tự chọn kiểu hay tính toán.'],
      ['Làm sao để gửi ảnh cho Kinie?', 'Sau khi đặt hàng, Kinie nhắn Zalo để xác nhận đơn và nhận ảnh. Bạn gửi ảnh qua Zalo hoặc link Google Drive, Kinie chỉnh màu và căn khung giúp bạn.'],
      ['Bao lâu thì nhận được hàng?', 'Kinie đóng gói cẩn thận và giao tận nơi trong khoảng 2–4 ngày.'],
      ['Phí vận chuyển là bao nhiêu?', 'Phí ship ' + shipFee + '/đơn. Đơn từ ' + freeShip + ' (bằng giá combo 20 ảnh) được miễn phí vận chuyển.'],
      ['Có những hình thức thanh toán nào?', 'Bạn có thể thanh toán khi nhận hàng (COD) hoặc chuyển khoản ngân hàng.'],
      ['Ảnh nam châm có hợp làm quà tặng không?', 'Rất hợp! Mỗi chiếc được làm tay nên là món quà kỷ niệm xinh xắn cho bạn bè, người yêu hay gia đình. Các combo gia đình còn được tặng thêm ảnh và free ship.'],
    ],

    // footer
    footTag: 'Biến những bức ảnh yêu thích thành nam châm xinh xắn – để kỷ niệm luôn ở ngay trên tủ lạnh.',
    footShop: 'Cửa hàng', footInfo: 'Thông tin', footConnect: 'Kết nối',

    // lỗi
    errNotFoundTitle: 'Không tìm thấy', errNotFound: 'Trang bạn tìm không tồn tại.', errServerTitle: 'Có lỗi xảy ra', errServer: 'Có lỗi xảy ra, vui lòng thử lại sau.',
    errSessionTitle: 'Phiên hết hạn', errSession: 'Phiên làm việc đã hết hạn, vui lòng thử lại.', backHome: 'Về trang chủ',
    vName: 'Vui lòng nhập tên.', vFullName: 'Vui lòng nhập họ tên.', vEmail: 'Email chưa hợp lệ.', vMsg: 'Tin nhắn hơi ngắn.',
    vPhone: 'Số điện thoại chưa hợp lệ.', vAddress: 'Vui lòng nhập địa chỉ đầy đủ.',
    mailMsg: 'tin nhắn mới', mailOrder: 'đơn mới',
  },

  en: {
    langName: 'EN', htmlLang: 'en',
    metaDesc: 'Nhật ký Kinie – handmade 6.5 × 8 cm photo magnets for your fridge. Send your photos on Zalo and get advice and a quote right away.',
    homeTitle: 'Handmade photo magnets',

    seoHome: 'Handmade fridge photo magnets from 29k',
    seoPrice: 'Fridge photo magnet pricing – 1 to 200 photos',
    seoShop: '6.5 × 8 cm fridge photo magnets',
    seoShopCat: (c) => c + ' – fridge photo magnets',
    seoProduct: (n) => (n === 1 ? '1 fridge photo magnet' : n + '-photo fridge magnet combo'),
    seoAbout: 'About Kinie – photo magnets made by hand',
    seoContact: 'Contact Kinie to print photo magnets',
    seoFaq: 'Fridge photo magnet FAQ',
    descHome: 'Handmade 6.5 × 8 cm fridge photo magnets from 29k each: 6-colour print, five waterproof coats, 3 mm magnet. Send photos on Zalo, delivered in 2–4 days.',
    descPrice: 'Kinie fridge photo magnet pricing from 1 to 200 photos: singles, value combos and family combos. The more photos, the cheaper – free shipping from 20 photos.',
    descShop: 'Pick a 6.5 × 8 cm fridge photo magnet combo: singles, value or family combos. 6-colour print, waterproof, handmade – order online or message on Zalo.',
    descShopCat: (c) => c + ' of 6.5 × 8 cm fridge photo magnets by Nhật ký Kinie. 6-colour print, five waterproof coats, 3 mm magnet – order online or on Zalo.',
    descProduct: (p, price) => (p.qty === 1 ? '1 fridge photo magnet' : p.qty + '-photo fridge magnet combo') + ', 6.5 × 8 cm, for ' + price +
      (p.gift ? ', ' + p.gift + ' free photo' + (p.gift > 1 ? 's' : '') : '') + (p.freeship ? ', free shipping' : '') + '. 6-colour print, five waterproof coats, 3 mm magnet, handmade.',
    descAbout: 'The story of Nhật ký Kinie: handmade fridge photo magnets, 6-colour printed, sealed with five coats, cut and mounted by hand – a sweet keepsake gift.',
    descContact: 'Contact Nhật ký Kinie to print fridge photo magnets: message on Zalo, call or send a note – Kinie advises and quotes right away.',
    descFaq: 'Answers about Kinie fridge photo magnets: size, durability, waterproofing, sending photos, delivery time, shipping fees and payment.',
    prodAlt: (p) => (p.qty === 1 ? '1' : p.qty + '-photo') + ' 6.5 × 8 cm fridge photo magnet' + (p.qty === 1 ? '' : ' combo') + ' – Nhật ký Kinie',
    ogLocale: 'en_US',

    home: 'Home', price: 'Pricing', magnets: 'Photo magnets', about: 'About Kinie', contact: 'Contact', cart: 'Cart',
    skip: 'Skip navigation', darkTo: 'Switch to dark mode', lightTo: 'Switch to light mode', menuOpen: 'Open menu',
    langLabel: 'Language', homeAria: 'Nhật ký Kinie – home', cartAria: 'Cart', mainMenu: 'Main menu',
    zalo: 'Zalo', zaloCta: 'Message on Zalo', zaloLong: 'Message Zalo for advice',
    photos: (n) => n + (n === 1 ? ' photo' : ' photos'), comboOf: (n) => 'Photo magnets – ' + n + (n === 1 ? ' photo' : ' photos'),
    hot: 'Best seller', freeship: 'Free shipping', gift: (n) => n + ' free photo' + (n > 1 ? 's' : ''), perPhoto: 'k/photo',
    addToCart: 'Add to cart', buyNow: 'Buy now', soldOut: 'Sold out', qtyLabel: 'Quantity', viewAll: 'See all →',

    handmadeBadge: 'Handmade in Vietnam · one at a time',
    heroTitle1: 'Kinie keeps it,', heroTitle2: 'you remember it.',
    heroBody: '6.5 × 8 cm photo magnets for your fridge. Send your photos on Zalo – I advise you and quote right away, so you never have to pick a style or do the maths.',
    heroCta: 'Send photos to print', ribbon: '100% handmade', yourPhoto: 'Your photo', mascotAlt: 'Kinie mascot holding photos',
    stats: [['6.5 × 8 cm', 'size'], ['3 mm', 'thickness'], ['29k', 'from, per photo']],
    feat: [
      ['HD/4K photos', 'Modern 6-colour printing – bright, true-to-life colour.'],
      ['Built to last', 'Five protective layers: waterproof, scratch-resistant, high gloss.'],
      ['Strong hold', 'Thick, flexible magnet that grips fridges, windows and any magnetic surface.'],
    ],
    quickEyebrow: 'Most loved', quickTitle: 'Order in one tap', quickSub: "Kinie's three most-ordered combos.",
    cardSubs: ['A small set for one fridge corner', 'Free shipping nationwide', '2 free photos + free shipping'],
    family: 'Family',
    otherQtyTitle: 'A different number?', otherQtyBody: 'See the full ladder, from 1 to 200 photos.', openPrice: 'Open pricing',
    stepsEyebrow: 'How it works', stepsTitle: 'From a photo to a magnet',
    steps: [
      ['Pick a size', 'Choose the combo that suits you – the more photos, the more you save.'],
      ['Send your photos', 'Send them on Zalo or a Google Drive link and Kinie fixes the colour and framing.'],
      ['Print & finish', '6-colour print, five protective coats, cut and mounted on the magnet by hand.'],
      ['Get your order', 'Carefully packed and delivered to your door in 2–4 days.'],
    ],
    quotesEyebrow: 'Kind words', quotesTitle: 'What customers say',
    quotes: [
      ['The colours are gorgeous and the magnet grips firmly. I gave sets to all my close friends and everyone loved them!', 'Ngọc Anh'],
      ['So beautifully packed, and Kinie advised me on Zalo so kindly.', 'Minh Quân'],
      ['Thick magnet, and the print matches my original photo. Will order again.', 'Thu Hà'],
    ],
    ctaTitle: 'Got photos to print?', ctaBody: "Message Kinie on Zalo – I'll advise you and quote right away.",

    priceEyebrow: 'Pricing', priceTitle: 'Kinie pricing',
    priceSub: 'Every price includes the printed photo, a 3 mm magnet and super-strong nano-acrylic glue.',
    tabs: { le: 'Single photos', combo: 'Value combos', 'gia-dinh': 'Family combos' },
    specs: [['Size', '6.5 × 8 cm'], ['Thickness', '3 mm'], ['Included gift', 'Nano-acrylic glue']],
    tip: "Kinie's tip", tipBody: "Not sure which combo? Send me all your photos on Zalo and I'll sort them for you.",
    singlePrice: (k) => k + '/photo',

    shopEyebrow: 'Photo magnets', shopTitle: '6.5 × 8 cm photo magnets', all: 'All', sort: 'Sort',
    sortDefault: 'Default', sortAsc: 'Price: low to high', sortDesc: 'Price: high to low', emptyCat: 'Nothing here yet.',
    crumbHome: 'Home', prodBody: 'Premium photo paper, five protective coats and a 3 mm flexible magnet. Every piece is cut and mounted by hand.',
    prodNote: 'After you order, Kinie will contact you to receive your photos via Zalo or a Google Drive link.',
    detailTitle: 'Product details',
    detailFeat: [
      ['6-colour print', 'Bright, true colour with natural skin tones.'],
      ['Waterproof', 'Five coats – wipe clean with a damp cloth.'],
      ['Made by hand', 'Kinie cuts, mounts and checks each one.'],
    ],
    approx: (u, n) => '≈ ' + u + 'k/photo · ' + n + '-photo combo', related: 'You might also like',
    specList: (p) => ['6.5 × 8 cm, 3 mm thick', '6-colour print, five protective coats', 'Flexible magnet that grips the fridge', p.qty + (p.qty === 1 ? ' photo' : ' photos') + (p.gift ? ' + ' + p.gift + ' free' : '')],

    cartTitle: 'Your cart', cartEmpty: 'Your cart is empty.', shopNow: 'Pick a combo', update: 'Update',
    subtotal: 'Subtotal', shipping: 'Shipping', free: 'Free',
    freeshipHint: (m) => 'Add ' + m + ' more for free shipping.', totalFull: 'Total', checkoutGo: 'Proceed to checkout',
    checkoutTitle: 'Checkout', fName: 'Full name', fPhone: 'Phone (Zalo)', fEmail: 'Email (optional)',
    fAddress: 'Delivery address', fNote: 'Note (Google Drive photo link, special requests…)', payMethod: 'Payment method',
    payCod: 'Cash on delivery (COD)', payBank: 'Bank transfer', placeOrder: 'Place order',
    yourOrder: 'Your order', shipShort: 'Shipping', total: 'Total',
    thanksTitle: 'Thank you for your order!',
    thanksBody: (code, phone) => ['Your order code: ', code, ". Kinie will message you on Zalo at ", phone, ' within 15 minutes to confirm and receive your photos.'],
    bankInfo: 'Bank transfer details', bankName: 'Bank', bankAcc: 'Account number', bankHolder: 'Account holder', amount: 'Amount', content: 'Transfer note',
    keepShopping: 'Keep browsing', successTitle: 'Order placed',

    aboutEyebrow: 'About Kinie', aboutTitle: 'Small moments deserve to be seen every day',
    aboutP1: 'Nhật ký Kinie started with an empty fridge and a stack of photos with nowhere to go. We believe the best photo is the one you see every morning.',
    aboutP2: 'Every Kinie photo magnet is 6-colour printed, sealed with five protective coats, then cut and mounted by hand – each detail is checked before packing.',
    aboutList: ['Colour-fast, waterproof, never peels', 'A 3 mm magnet that grips firmly without scratching', 'Made one by one – perfect as a gift'],
    aboutCta: 'See pricing', aboutAlt: 'Nhật ký Kinie photo magnets',
    contactTitle: 'Tell Kinie your idea', fMsgName: 'Name', fMsgEmail: 'Email', fMsg: 'Message', send: 'Send message',
    contactThanks: "Thank you! Kinie got your message and will reply soon.", quick: 'Or message directly:',

    faqNav: 'FAQ', faqEyebrow: 'FAQ', faqTitle: 'Photo magnet FAQ',
    faqSub: "What customers usually ask Kinie before ordering. Can't find your answer? Message me on Zalo.",
    faqLink: 'Frequently asked questions →', faqMore: 'Still have questions?',
    faq: (minPrice, freeShip, shipFee) => [
      ['What size are Kinie photo magnets?', 'Each photo magnet is 6.5 × 8 cm and 3 mm thick – a neat fit for fridges, windows and magnetic boards.'],
      ['Are the magnets waterproof and colour-fast?', 'Yes. Each photo is 6-colour printed and sealed with five protective coats, so it is waterproof, scratch-resistant and keeps its colour. Just wipe it with a damp cloth.'],
      ['Will the magnet hold firmly without scratching my fridge?', 'The 3 mm flexible magnet grips fridges, windows and any magnetic surface firmly without scratching.'],
      ['How much does a photo magnet cost?', 'Single photos start at ' + minPrice + ' each. Packs go from 1 to 200 photos – the more you order, the less each photo costs. See the Pricing page for details.'],
      ["I'm not sure which combo to pick.", 'Send all your photos on Zalo – Kinie suggests the right combo and quotes right away, so you never have to do the maths.'],
      ['How do I send my photos?', 'After you order, Kinie messages you on Zalo to confirm and receive your photos. Send them on Zalo or as a Google Drive link and Kinie fixes the colour and framing.'],
      ['How long does delivery take?', 'Orders are carefully packed and delivered to your door in about 2–4 days.'],
      ['How much is shipping?', 'Shipping is ' + shipFee + ' per order. Orders from ' + freeShip + ' (the price of the 20-photo combo) ship free.'],
      ['How can I pay?', 'You can pay cash on delivery (COD) or by bank transfer.'],
      ['Do photo magnets make good gifts?', 'Absolutely! Every piece is handmade, so it makes a sweet keepsake for friends, partners or family. Family combos also include free photos and free shipping.'],
    ],

    footTag: 'Turning your favourite photos into cute magnets – so memories stay right on your fridge.',
    footShop: 'Shop', footInfo: 'Info', footConnect: 'Connect',

    errNotFoundTitle: 'Not found', errNotFound: "The page you're looking for doesn't exist.", errServerTitle: 'Something went wrong', errServer: 'Something went wrong, please try again later.',
    errSessionTitle: 'Session expired', errSession: 'Your session expired, please try again.', backHome: 'Back to home',
    vName: 'Please enter your name.', vFullName: 'Please enter your full name.', vEmail: 'That email looks invalid.', vMsg: 'Your message is a bit short.',
    vPhone: 'That phone number looks invalid.', vAddress: 'Please enter your full address.',
    mailMsg: 'new message', mailOrder: 'new order',
  },
};

const LANGS = Object.keys(dict);

function translator(lang) {
  const d = dict[lang] || dict.vi;
  return (key, ...args) => {
    const v = d[key] !== undefined ? d[key] : dict.vi[key];
    if (v === undefined) return key;
    return typeof v === 'function' ? v(...args) : v;
  };
}

module.exports = { dict, LANGS, translator };
