require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieSession = require('cookie-session');
const nodemailer = require('nodemailer');
const db = require('./lib/db');
const photos = require('./lib/photos');
const sheet = require('./lib/sheet');
const { artSvg } = require('./lib/art');
const { LANGS, translator } = require('./lib/i18n');
const landings = require('./data/landings');
const posts = require('./data/blog');
const reviews = require('./data/reviews');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const FREE_SHIP = 379000; // = giá combo 20 ảnh, từ mức này trở lên được free ship
const SHIP_FEE = 25000;

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

// Gộp www về tên miền chính (www.kinie.online -> kinie.online) để Google không coi là hai trang trùng nhau.
app.use((req, res, next) => {
  if (!req.hostname.startsWith('www.')) return next();
  res.redirect(301, `${req.protocol}://${req.hostname.slice(4)}${req.originalUrl}`);
});

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'img-src': ["'self'", 'data:', 'https:'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'script-src': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': isProd ? [] : null,
    },
  },
}));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(cookieSession({
  name: 'kinie', keys: [SECRET], maxAge: 1000 * 60 * 60 * 24 * 14,
  sameSite: 'lax', httpOnly: true, secure: isProd,
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '7d' : 0 }));

// ---------- helpers ----------
const money = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const site = {
  name: 'Kinie',
  // Tên miền chính dùng cho canonical, sitemap, robots. Trên server luôn là kinie.online kể cả khi quên đặt SITE_URL,
  // để www.kinie.online không sinh ra bản sitemap/robots thứ hai.
  url: process.env.SITE_URL || (isProd ? 'https://kinie.online' : ''),
  // Liên hệ thật của shop (cố định trong mã, không đọc từ .env để tránh bị số mẫu đè lên).
  email: 'baonguyen.11042004@gmail.com',
  phones: [
    { tel: '0862328336', label: '0862 328 336', zalo: 'https://zalo.me/0862328336' },
    { tel: '0834231021', label: '0834 231 021', zalo: 'https://zalo.me/0834231021' },
  ],
  phone: '0862 328 336 · 0834 231 021',
  zalo: 'https://zalo.me/0862328336',
  tiktok: 'https://www.tiktok.com/@nhatkykinie',
  instagram: process.env.INSTAGRAM_URL || '#',
  facebook: process.env.FACEBOOK_URL || '#',
  freeShip: FREE_SHIP,
  shipFee: SHIP_FEE,
};
// Nhóm giá; tên hiển thị theo ngôn ngữ lấy từ t('tabs')[id].
const categories = [
  { id: 'le', name: 'Ảnh lẻ' },
  { id: 'combo', name: 'Combo tiết kiệm' },
  { id: 'gia-dinh', name: 'Combo gia đình' },
];
const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const productImg = (p) => p.image || `/art/${p.id}.svg`;
// 29000 -> '29k', 1421000 -> '1.421k'
const kfmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n / 1000)) + 'k';

// Mỗi dòng giỏ hàng: { id, qty: 1, uid, mode } – một combo, ảnh của khách nằm ở data/uploads/<uid>/.
// mode: 'frames' = khách tự thêm ảnh vào khung trên web, 'zalo' = gửi ảnh qua Zalo sau khi đặt.
// Dòng cũ (trước khi có khung) có photos = link album.
const MAX_LINES = 6; // giỏ hàng nằm trong cookie (~4 KB)
const framesOf = (p) => p.qty + (p.gift || 0); // số khung = số ảnh của combo + ảnh tặng
function cartOf(req, withPhotos = false) {
  const products = db.get().products;
  const items = [];
  (req.session.cart || []).forEach((line, index) => {
    const p = products.find((x) => x.id === line.id);
    if (!p) return;
    const item = {
      index, product: p, qty: line.qty, uid: line.uid || '', photos: line.photos || '',
      mode: line.uid ? line.mode || 'frames' : line.photos ? 'link' : 'zalo', frames: framesOf(p), total: p.price * line.qty,
    };
    if (withPhotos) {
      item.saved = item.uid ? photos.slots(item.uid).filter((s) => s < item.frames).length : 0;
      item.ready = item.mode !== 'frames' || item.saved >= item.frames;
    }
    items.push(item);
  });
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const shipping = !items.length || subtotal >= FREE_SHIP ? 0 : SHIP_FEE;
  return { items, subtotal, shipping, total: subtotal + shipping, count: items.reduce((s, i) => s + i.qty, 0) };
}
// Trạng thái đơn: khoá lưu trong db -> tên hiển thị ở /admin và trên Google Sheet (hai nơi phải trùng chữ).
const STATUS = {
  unpaid: 'Chờ thanh toán', paid: 'Đã nhận tiền', confirmed: 'Đã xác nhận', shipping: 'Đang giao',
  done: 'Hoàn thành', cancelled: 'Đã huỷ', new: 'Mới (đơn cũ)',
};
const statusKey = (v) => {
  const s = String(v ?? '').trim();
  return STATUS[s] ? s : Object.keys(STATUS).find((k) => STATUS[k] === s) || '';
};
// Một dòng trên Google Sheet cho mỗi đơn.
const sheetRow = (o) => ({
  code: o.code, createdAt: o.createdAt, status: STATUS[o.status] || o.status,
  name: o.name, phone: o.phone, email: o.email || '', address: o.address, note: o.note || '',
  items: o.items.map((i) => `${i.name} ×${i.qty}`).join('; '),
  photos: o.items.map((i) => (i.mode === 'frames' ? `${photos.slots(i.uid).length}/${i.frames} ảnh trong khung`
    : i.photos ? 'link album' : 'gửi qua Zalo')).join('; '),
  subtotal: o.subtotal, shipping: o.shipping, total: o.total,
  printUrl: (site.url || 'https://kinie.online') + '/admin/orders/' + o.code + '/in',
});
const lineOf = (req) => (photos.isUid(req.params.uid) ? (req.session.cart || []).find((l) => l.uid === req.params.uid) : null);

function csrf(req) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(16).toString('hex');
  return req.session.csrf;
}
function checkCsrf(req, res, next) {
  if (req.body._csrf && req.body._csrf === req.session.csrf) return next();
  res.status(403).render('error', { title: req.t('errSessionTitle'), message: req.t('errSession'), noindex: true });
}
// Cho các yêu cầu fetch (tải ảnh lên): mã chống giả mạo nằm ở header.
function checkCsrfHeader(req, res, next) {
  const token = req.get('X-CSRF-Token');
  if (token && token === req.session.csrf) return next();
  res.status(403).json({ error: 'session' });
}

// Ngôn ngữ nằm trong URL để Google lập chỉ mục được cả hai bản: /bang-gia (VI) và /en/bang-gia (EN).
// Bỏ tiền tố /en ra khỏi req.url để các route bên dưới dùng chung.
app.use((req, res, next) => {
  req.lang = 'vi';
  if (/^\/en(\/|\?|$)/.test(req.url)) {
    req.lang = 'en';
    const rest = req.url.slice(3);
    req.url = rest.startsWith('/') ? rest : '/' + rest;
  }
  next();
});
// Đường dẫn theo ngôn ngữ: u('/bang-gia') -> '/en/bang-gia' khi đang ở bản EN.
const localize = (lang, p) => (lang === 'vi' ? p : p === '/' ? '/' + lang : '/' + lang + p);
const baseUrl = (req) => (site.url || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

app.use((req, res, next) => {
  const lang = req.lang;
  const base = baseUrl(req);
  req.t = translator(lang);
  req.u = (p) => localize(lang, p);
  res.locals.u = req.u;
  res.locals.base = base;
  res.locals.alternates = LANGS.map((l) => ({ lang: l, href: base + localize(l, req.path) }));
  res.locals.canonical = base + req.u(req.path);
  res.locals.ogImage = base + '/img/og-kinie.jpg';
  res.locals.ogType = 'website';
  // Giỏ hàng, thanh toán, admin: không đưa lên kết quả tìm kiếm.
  res.locals.noindex = /^\/(gio-hang|thanh-toan|dat-hang-thanh-cong|admin)(\/|$)/.test(req.path);
  res.locals.jsonLd = [];
  res.locals.lang = lang;
  res.locals.t = req.t;
  res.locals.langs = LANGS;
  res.locals.kfmt = kfmt;
  res.locals.site = site;
  res.locals.money = money;
  res.locals.categories = categories;
  res.locals.productImg = productImg;
  res.locals.landings = landings;
  res.locals.csrf = csrf(req);
  res.locals.cartCount = cartOf(req).count;
  res.locals.path = req.path;
  res.locals.title = '';
  res.locals.desc = req.t('metaDesc');
  next();
});

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

async function notify(subject, text) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_TO) return;
  try {
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 465,
      secure: (Number(process.env.SMTP_PORT) || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await t.sendMail({ from: process.env.SMTP_USER, to: process.env.NOTIFY_TO, subject, text });
  } catch (e) { console.error('Mail error:', e.message); }
}

// ---------- art ----------
app.get('/art/:id.svg', (req, res) => {
  const p = db.get().products.find((x) => x.id === req.params.id);
  res.type('image/svg+xml').set('Cache-Control', 'public, max-age=86400').send(artSvg(p || { hue: 350, category: 'polaroid' }));
});

// ---------- structured data (JSON-LD) ----------
const priceRange = () => {
  const prices = db.get().products.map((p) => p.price);
  return prices.length ? `${money(Math.min(...prices))} – ${money(Math.max(...prices))}` : undefined;
};
const storeLd = (req, base) => ({
  '@context': 'https://schema.org', '@type': 'Store', '@id': base + '/#store',
  name: 'Kinie', alternateName: ['Nhật ký Kinie', 'Kinie Memory'], url: base + req.u('/'),
  description: req.t('descHome'), image: base + '/img/logo.jpg', logo: base + '/img/logo.jpg',
  email: site.email, telephone: site.phones.map((p) => p.tel), priceRange: priceRange(),
  address: { '@type': 'PostalAddress', addressCountry: 'VN' },
  sameAs: [site.tiktok, site.instagram, site.facebook].filter((x) => x && x !== '#'),
});
// Trang chỉ có bản tiếng Việt (trang theo dịp, blog, đánh giá): /en/... chuyển về bản VI, hreflang chỉ khai báo VI.
function viOnly(req, res) {
  if (req.lang !== 'vi') { res.redirect(301, req.path); return false; }
  res.locals.alternates = res.locals.alternates.filter((a) => a.lang === 'vi');
  return true;
}
const crumbLd = (base, items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: base + url })),
});

// ---------- pages ----------
// Link cũ chuyển ngôn ngữ bằng session: chuyển sang URL mới.
app.get('/ngon-ngu/:lang', (req, res) => res.redirect(301, localize(LANGS.includes(req.params.lang) ? req.params.lang : 'vi', '/')));

app.get('/', (req, res) => {
  const products = db.get().products;
  const quick = ['p6', 'p20', 'p50'].map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const base = res.locals.base;
  res.locals.jsonLd.push(storeLd(req, base), {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'Kinie', alternateName: 'Nhật ký Kinie', url: base + req.u('/'), inLanguage: req.t('htmlLang'),
  });
  res.render('index', { title: req.t('seoHome'), desc: req.t('descHome'), quick, reviews: reviews.slice(0, 3), latest: posts.slice(0, 3) });
});

app.get('/bang-gia', (req, res) => {
  const all = db.get().products;
  const groups = categories.map((c) => ({ id: c.id, rows: all.filter((p) => p.category === c.id).sort((a, b) => a.qty - b.qty) }));
  res.locals.jsonLd.push(crumbLd(res.locals.base, [[req.t('home'), req.u('/')], [req.t('price'), req.u('/bang-gia')]]));
  res.render('price', { title: req.t('seoPrice'), desc: req.t('descPrice'), groups });
});

app.get('/cua-hang', (req, res) => {
  const cat = categories.some((c) => c.id === req.query.cat) ? req.query.cat : '';
  const sort = str(req.query.sort, 10);
  let list = [...db.get().products];
  if (cat) list = list.filter((p) => p.category === cat);
  if (sort === 'asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'desc') list.sort((a, b) => b.price - a.price);
  // Mỗi nhóm là một trang riêng (có ?cat=); các biến thể sắp xếp thì không cho lập chỉ mục.
  const qs = cat ? '?cat=' + cat : '';
  res.locals.canonical += qs;
  res.locals.alternates.forEach((a) => { a.href += qs; });
  res.locals.noindex = Boolean(sort);
  const catName = cat ? req.t('tabs')[cat] : '';
  res.render('shop', {
    title: cat ? req.t('seoShopCat', catName) : req.t('seoShop'),
    desc: cat ? req.t('descShopCat', catName) : req.t('descShop'),
    list, cat, sort,
  });
});

app.get('/san-pham/:slug', (req, res, next) => {
  const p = db.get().products.find((x) => x.slug === req.params.slug);
  if (!p) return next();
  productPage(req, res, p);
});

// Trang sản phẩm; extra = { errors } khi không thêm được vào giỏ.
function productPage(req, res, p, extra = {}) {
  const products = db.get().products;
  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  const base = res.locals.base;
  const img = productImg(p);
  if (p.image && !/\.svg$/i.test(p.image)) res.locals.ogImage = /^https?:/.test(img) ? img : base + img;
  res.locals.ogType = 'product';
  res.locals.jsonLd.push({
    '@context': 'https://schema.org', '@type': 'Product',
    name: req.t('comboOf', p.qty), sku: p.id, image: /^https?:/.test(img) ? img : base + img,
    description: req.t('descProduct', p, money(p.price)),
    brand: { '@type': 'Brand', name: 'Kinie' },
    offers: {
      '@type': 'Offer', url: res.locals.canonical, price: p.price, priceCurrency: 'VND',
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition', seller: { '@id': base + '/#store' },
    },
  }, crumbLd(base, [[req.t('home'), req.u('/')], [req.t('magnets'), req.u('/cua-hang')], [req.t('photos', p.qty), req.u('/san-pham/' + p.slug)]]));
  res.status(extra.errors ? 400 : 200).render('product', {
    title: req.t('seoProduct', p.qty), desc: req.t('descProduct', p, money(p.price)), p, related, errors: [], ...extra,
  });
}

app.get('/ve-kinie', (req, res) => {
  res.locals.jsonLd.push(storeLd(req, res.locals.base),
    crumbLd(res.locals.base, [[req.t('home'), req.u('/')], [req.t('about'), req.u('/ve-kinie')]]));
  res.render('about', { title: req.t('seoAbout'), desc: req.t('descAbout') });
});

// ---------- trang theo dịp, blog, đánh giá (chỉ tiếng Việt) ----------
const pickProducts = (ids) => ids.map((id) => db.get().products.find((p) => p.id === id)).filter(Boolean);

landings.forEach((l) => {
  app.get('/' + l.slug, (req, res) => {
    if (!viOnly(req, res)) return;
    const base = res.locals.base;
    res.locals.jsonLd.push(crumbLd(base, [[req.t('home'), '/'], [l.h1, '/' + l.slug]]));
    if (l.faq.length) {
      res.locals.jsonLd.push({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: l.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      });
    }
    res.render('landing', { title: l.title, desc: l.desc, l, combos: pickProducts(l.combos), others: landings.filter((x) => x !== l) });
  });
});

app.get('/blog', (req, res) => {
  if (!viOnly(req, res)) return;
  res.locals.jsonLd.push(crumbLd(res.locals.base, [[req.t('home'), '/'], ['Blog', '/blog']]));
  res.render('blog', {
    title: 'Blog Kinie – ý tưởng quà tặng và ảnh nam châm',
    desc: 'Blog của Kinie: ý tưởng quà tặng, cách chọn ảnh để in, cách làm và trang trí tủ lạnh bằng ảnh nam châm.',
    posts,
  });
});

app.get('/blog/:slug', (req, res, next) => {
  const post = posts.find((x) => x.slug === req.params.slug);
  if (!post) return next();
  if (!viOnly(req, res)) return;
  const base = res.locals.base;
  res.locals.ogType = 'article';
  res.locals.jsonLd.push({
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.desc,
    datePublished: post.date, dateModified: post.date, inLanguage: 'vi', mainEntityOfPage: base + '/blog/' + post.slug,
    image: base + '/img/og-kinie.jpg', author: { '@type': 'Organization', name: 'Kinie' },
    publisher: { '@type': 'Organization', name: 'Kinie', logo: { '@type': 'ImageObject', url: base + '/img/logo.jpg' } },
  }, crumbLd(base, [[req.t('home'), '/'], ['Blog', '/blog'], [post.title, '/blog/' + post.slug]]));
  res.render('post', { title: post.title, desc: post.desc, post, more: posts.filter((x) => x !== post).slice(0, 3) });
});

app.get('/danh-gia', (req, res) => {
  if (!viOnly(req, res)) return;
  // Chưa có đánh giá thật thì không cho Google lập chỉ mục trang trống.
  if (!reviews.length) res.locals.noindex = true;
  res.locals.jsonLd.push(crumbLd(res.locals.base, [[req.t('home'), '/'], [req.t('reviewsNav'), '/danh-gia']]));
  res.render('reviews', { title: req.t('seoReviews'), desc: req.t('descReviews'), reviews });
});

app.get('/hoi-dap', (req, res) => {
  const minPrice = Math.min(...db.get().products.filter((p) => p.qty === 1).map((p) => p.price));
  const faq = req.t('faq', money(Number.isFinite(minPrice) ? minPrice : 29000), money(FREE_SHIP), money(SHIP_FEE));
  res.locals.jsonLd.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }, crumbLd(res.locals.base, [[req.t('home'), req.u('/')], [req.t('faqNav'), req.u('/hoi-dap')]]));
  res.render('faq', { title: req.t('seoFaq'), desc: req.t('descFaq'), faq });
});

const contactPage = (req, extra) => ({ title: req.t('seoContact'), desc: req.t('descContact'), sent: false, errors: [], form: {}, ...extra });
app.get('/lien-he', (req, res) => {
  const sent = req.query.sent === '1';
  if (sent) res.locals.noindex = true;
  res.render('contact', contactPage(req, { sent }));
});

app.post('/lien-he', formLimiter, checkCsrf, async (req, res) => {
  const form = { name: str(req.body.name, 80), email: str(req.body.email, 120), message: str(req.body.message, 2000) };
  if (str(req.body.website)) return res.redirect(req.u('/lien-he') + '?sent=1'); // honeypot
  const errors = [];
  if (!form.name) errors.push(req.t('vName'));
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.push(req.t('vEmail'));
  if (form.message.length < 5) errors.push(req.t('vMsg'));
  if (errors.length) return res.status(400).render('contact', contactPage(req, { errors, form }));
  const s = db.get();
  s.messages.unshift({ ...form, at: new Date().toISOString() });
  db.save();
  notify('Kinie – tin nhắn mới', `${form.name} <${form.email}>\n\n${form.message}`);
  res.redirect(req.u('/lien-he') + '?sent=1');
});

// ---------- cart ----------
app.get('/gio-hang', (req, res) => res.render('cart', { title: req.t('cartTitle'), cart: cartOf(req, true) }));

// Thêm vào giỏ: mỗi lần thêm là một dòng riêng (một bộ ảnh riêng), rồi sang bước thêm ảnh vào khung.
app.post('/gio-hang/them', checkCsrf, (req, res) => {
  const id = str(req.body.id, 60);
  const p = db.get().products.find((x) => x.id === id);
  if (!p) return res.redirect(req.u('/cua-hang'));
  const cart = req.session.cart || [];
  if (cart.length >= MAX_LINES) return productPage(req, res, p, { errors: [req.t('cartFull')] });
  const uid = photos.newUid();
  cart.push({ id, qty: 1, uid, mode: 'frames' });
  req.session.cart = cart;
  res.redirect(req.u('/gio-hang/anh/' + uid));
});

app.post('/gio-hang/cap-nhat', checkCsrf, (req, res) => {
  const i = parseInt(req.body.i, 10);
  const qty = parseInt(req.body.qty, 10) || 0;
  const cart = req.session.cart || [];
  if (cart[i] && qty <= 0) {
    const [removed] = cart.splice(i, 1);
    if (removed.uid) photos.removeAll(removed.uid); // ảnh của dòng chưa thành đơn
  }
  req.session.cart = cart;
  res.redirect(req.u('/gio-hang'));
});

// ---------- thêm ảnh vào khung ----------
app.get('/gio-hang/anh/:uid', (req, res, next) => {
  const line = lineOf(req);
  if (!line) return res.redirect(req.u('/gio-hang'));
  const p = db.get().products.find((x) => x.id === line.id);
  if (!p) return next();
  const cart = req.session.cart;
  res.render('frames', {
    title: req.t('frTitle'), p, uid: line.uid, frames: framesOf(p), saved: photos.slots(line.uid),
    zalo: line.mode === 'zalo', missing: req.query.thieu === '1', more: cart.length > 1,
  });
});

app.get('/gio-hang/anh/:uid/:file', (req, res) => {
  const file = lineOf(req) && photos.filePath(req.params.uid, req.params.file);
  if (!file) return res.sendStatus(404);
  res.set('Cache-Control', 'private, no-store').sendFile(file);
});

// Dự phòng: khách không tải được ảnh thì hẹn gửi qua Zalo sau khi đặt (khai báo trước route /:slot).
app.post('/gio-hang/anh/:uid/zalo', checkCsrf, (req, res) => {
  const line = lineOf(req);
  if (line) { line.mode = 'zalo'; req.session.cart = [...req.session.cart]; }
  res.redirect(req.u('/gio-hang'));
});

const uploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 1500, standardHeaders: true, legacyHeaders: false });
const slotOf = (req, line) => {
  const p = line && db.get().products.find((x) => x.id === line.id);
  const slot = /^\d{1,3}$/.test(req.params.slot) ? parseInt(req.params.slot, 10) : -1;
  return p && slot < framesOf(p) ? slot : -1;
};
app.post('/gio-hang/anh/:uid/:slot', uploadLimiter, checkCsrfHeader,
  express.raw({ type: 'image/jpeg', limit: photos.MAX_BYTES }), (req, res) => {
    const line = lineOf(req);
    const slot = slotOf(req, line);
    if (slot < 0) return res.status(404).json({ error: 'slot' });
    if (!photos.isJpeg(req.body)) return res.status(400).json({ error: 'image' });
    photos.save(line.uid, slot, req.body);
    if (line.mode !== 'frames') { line.mode = 'frames'; req.session.cart = [...req.session.cart]; }
    res.json({ saved: photos.slots(line.uid).length });
  });
app.delete('/gio-hang/anh/:uid/:slot', uploadLimiter, checkCsrfHeader, (req, res) => {
  const line = lineOf(req);
  const slot = slotOf(req, line);
  if (slot < 0) return res.status(404).json({ error: 'slot' });
  photos.remove(line.uid, slot);
  res.json({ saved: photos.slots(line.uid).length });
});

// ---------- checkout ----------
// Combo nào còn thiếu ảnh thì quay lại bước thêm ảnh của combo đó.
const notReady = (cart) => cart.items.find((i) => !i.ready);

app.get('/thanh-toan', (req, res) => {
  const cart = cartOf(req, true);
  if (!cart.items.length) return res.redirect(req.u('/gio-hang'));
  const todo = notReady(cart);
  if (todo) return res.redirect(req.u('/gio-hang/anh/' + todo.uid) + '?thieu=1');
  res.render('checkout', { title: req.t('checkoutTitle'), cart, errors: [], form: {} });
});

app.post('/thanh-toan', formLimiter, checkCsrf, async (req, res) => {
  const cart = cartOf(req, true);
  if (!cart.items.length) return res.redirect(req.u('/gio-hang'));
  const todo = notReady(cart);
  if (todo) return res.redirect(req.u('/gio-hang/anh/' + todo.uid) + '?thieu=1');
  // Sản phẩm in theo ảnh riêng của khách nên chỉ nhận chuyển khoản trước 100%.
  const form = {
    name: str(req.body.name, 80), phone: str(req.body.phone, 20), email: str(req.body.email, 120),
    address: str(req.body.address, 250), note: str(req.body.note, 500), payment: 'bank',
  };
  const errors = [];
  if (!form.name) errors.push(req.t('vFullName'));
  if (!/^(\+?84|0)\d{8,10}$/.test(form.phone.replace(/[\s.-]/g, ''))) errors.push(req.t('vPhone'));
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.push(req.t('vEmail'));
  if (form.address.length < 8) errors.push(req.t('vAddress'));
  if (errors.length) return res.status(400).render('checkout', { title: req.t('checkoutTitle'), cart, errors, form });

  const code = db.nextOrderCode();
  const order = {
    code, key: crypto.randomBytes(8).toString('hex'), status: 'unpaid', createdAt: new Date().toISOString(), ...form,
    items: cart.items.map((i) => ({
      id: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty,
      mode: i.mode, uid: i.uid, frames: i.frames, photos: i.photos,
    })),
    subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total,
  };
  db.get().orders.unshift(order);
  db.save();
  req.session.cart = [];
  req.session.lastOrder = code;
  notify(`Kinie – đơn mới ${code} (chờ chuyển khoản)`, `${form.name} – ${form.phone}\n${form.address}\nTổng: ${money(order.total)}\n` +
    order.items.map((i) => `- ${i.name} | Ảnh: ${i.mode === 'frames' ? i.frames + ' ảnh đã vào khung' : i.photos || 'gửi qua Zalo'}`).join('\n'));
  sheet.send({ event: 'new', order: sheetRow(order) }); // thêm dòng vào Sheet + Gmail báo đơn mới
  res.redirect(req.u('/dat-hang-thanh-cong'));
});

// Mã QR chuyển khoản (VietQR) có sẵn số tiền và mã đơn. BANK_ID là mã ngân hàng theo VietQR (vd VCB, MB, TCB).
const bank = {
  id: process.env.BANK_ID || '', name: process.env.BANK_NAME || '',
  account: process.env.BANK_ACCOUNT || '', holder: process.env.BANK_HOLDER || '',
};
const qrUrl = (o) => (bank.id && bank.account
  ? `https://img.vietqr.io/image/${encodeURIComponent(bank.id)}-${encodeURIComponent(bank.account)}-compact2.png` +
    `?amount=${o.total}&addInfo=${encodeURIComponent(o.code)}&accountName=${encodeURIComponent(bank.holder)}`
  : '');
const successPage = (req, res, order) => res.render('success', {
  title: req.t('successTitle'), order, bank, qr: qrUrl(order),
  link: order.key ? res.locals.base + req.u(`/don-hang/${order.code}/${order.key}`) : '',
});

app.get('/dat-hang-thanh-cong', (req, res) => {
  const order = db.get().orders.find((o) => o.code === req.session.lastOrder);
  if (!order) return res.redirect(req.u('/'));
  successPage(req, res, order);
});

// Link riêng để khách mở lại thông tin chuyển khoản của đơn (mã đơn + khoá ngẫu nhiên).
app.get('/don-hang/:code/:key', (req, res, next) => {
  const order = db.get().orders.find((o) => o.code === req.params.code);
  if (!order || !order.key || !safeEq(String(req.params.key), order.key)) return next();
  res.locals.noindex = true;
  successPage(req, res, order);
});

// ---------- admin ----------
const safeEq = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const requireAdmin = (req, res, next) => (req.session.admin ? next() : res.redirect('/admin/login'));
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

app.get('/admin/login', (req, res) => res.render('admin/login', { title: 'Admin', error: '' }));
app.post('/admin/login', loginLimiter, checkCsrf, (req, res) => {
  if (safeEq(str(req.body.password, 100), ADMIN_PASSWORD)) { req.session.admin = true; return res.redirect('/admin'); }
  res.status(401).render('admin/login', { title: 'Admin', error: 'Sai mật khẩu.' });
});
app.post('/admin/logout', checkCsrf, (req, res) => { req.session.admin = false; res.redirect('/'); });

app.get('/admin', requireAdmin, (req, res) => {
  const s = db.get();
  res.render('admin/dashboard', {
    title: 'Admin – Tổng quan', orders: s.orders, products: s.products, messages: s.messages,
    savedOf: (uid) => photos.slots(uid).length, labels: STATUS,
    sheet: { enabled: sheet.enabled(), last: sheet.last, result: str(req.query.sheet, 5) },
    // Doanh thu chỉ tính đơn đã nhận tiền (không tính đơn chờ chuyển khoản hoặc đã huỷ).
    revenue: s.orders.filter((o) => !['unpaid', 'cancelled'].includes(o.status)).reduce((n, o) => n + o.total, 0),
  });
});

app.post('/admin/orders/:code/status', requireAdmin, checkCsrf, (req, res) => {
  const o = db.get().orders.find((x) => x.code === req.params.code);
  const key = statusKey(req.body.status);
  if (o && key && o.status !== key) {
    o.status = key;
    db.save();
    sheet.send({ event: 'update', order: sheetRow(o) });
  }
  res.redirect('/admin');
});

// Gửi lại toàn bộ đơn sang Sheet: dùng lần đầu nối Sheet, hoặc khi lần gửi trước bị lỗi.
app.post('/admin/sheet/sync', requireAdmin, checkCsrf, async (req, res) => {
  const ok = await sheet.send({ event: 'sync', orders: db.get().orders.map(sheetRow) });
  res.redirect('/admin?sheet=' + (ok ? 'ok' : 'err'));
});

// Google Sheet -> web: CEO đổi cột Trạng thái trên Sheet, Apps Script gọi vào đây (xác thực bằng ORDERS_HOOK_SECRET).
const sheetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });
app.post('/api/sheet/status', sheetLimiter, express.json({ limit: '10kb' }), (req, res) => {
  const b = req.body || {};
  if (!sheet.checkSecret(b.secret)) return res.status(403).json({ ok: false, error: 'Sai mã bí mật' });
  const o = db.get().orders.find((x) => x.code === str(b.code, 20));
  if (!o) return res.status(404).json({ ok: false, error: 'Không có đơn ' + str(b.code, 20) + ' trên web' });
  const key = statusKey(b.status);
  if (!key) return res.status(400).json({ ok: false, error: 'Trạng thái không hợp lệ' });
  if (o.status !== key) { o.status = key; db.save(); }
  res.json({ ok: true, status: STATUS[key] });
});

// Trang in khung A4 của một đơn: ảnh khách đã cắt sẵn, xếp theo khung in chuyên dụng của Kinie.
app.get('/admin/orders/:code/in', requireAdmin, (req, res, next) => {
  const o = db.get().orders.find((x) => x.code === req.params.code);
  if (!o) return next();
  const list = o.items.flatMap((i) => (i.uid ? photos.slots(i.uid).map((s) => `/admin/anh/${i.uid}/${photos.fileName(s)}`) : []));
  res.render('admin/print', { title: 'In khung ' + o.code, order: o, list, noindex: true });
});

app.get('/admin/anh/:uid/:file', requireAdmin, (req, res) => {
  const file = photos.filePath(req.params.uid, req.params.file);
  if (!file) return res.sendStatus(404);
  res.set('Cache-Control', 'private, max-age=3600').sendFile(file);
});

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

app.post('/admin/products/save', requireAdmin, checkCsrf, (req, res) => {
  const s = db.get();
  const name = str(req.body.name, 120);
  if (!name) return res.redirect('/admin');
  const data = {
    name, category: categories.some((c) => c.id === req.body.category) ? req.body.category : 'le',
    qty: Math.max(1, parseInt(req.body.qty, 10) || 1), gift: Math.max(0, parseInt(req.body.gift, 10) || 0),
    price: Math.max(0, parseInt(req.body.price, 10) || 0), oldPrice: Math.max(0, parseInt(req.body.oldPrice, 10) || 0),
    stock: Math.max(0, parseInt(req.body.stock, 10) || 0), image: str(req.body.image, 300),
    hot: req.body.hot === 'on', freeship: req.body.freeship === 'on', featured: req.body.featured === 'on',
  };
  const existing = s.products.find((p) => p.id === req.body.id);
  if (existing) Object.assign(existing, data);
  else {
    const id = slugify(name) + '-' + Date.now().toString(36).slice(-4);
    s.products.push({ id, slug: id, hue: 340 + Math.floor(Math.random() * 40), ...data });
  }
  db.save();
  res.redirect('/admin#products');
});

app.post('/admin/products/:id/delete', requireAdmin, checkCsrf, (req, res) => {
  const s = db.get();
  s.products = s.products.filter((p) => p.id !== req.params.id);
  db.save();
  res.redirect('/admin#products');
});

// ---------- seo + errors ----------
app.get('/robots.txt', (req, res) => res.type('text/plain').send(
  `User-agent: *\nDisallow: /admin\nDisallow: /en/admin\nDisallow: /api/\nDisallow: /ngon-ngu/\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`));

// Trang song ngữ: khai báo cặp hreflang VI/EN. Trang theo dịp, blog, đánh giá: chỉ bản VI.
app.get('/sitemap.xml', (req, res) => {
  const base = baseUrl(req);
  const pages = [
    ['/', '1.0'], ['/bang-gia', '0.9'], ['/cua-hang', '0.8'],
    ...categories.map((c) => ['/cua-hang?cat=' + c.id, '0.7']),
    ['/hoi-dap', '0.7'], ['/ve-kinie', '0.6'], ['/lien-he', '0.5'],
    ...db.get().products.map((p) => ['/san-pham/' + p.slug, '0.6']),
  ];
  const viPages = [
    ...landings.map((l) => ['/' + l.slug, '0.8']),
    ['/blog', '0.6'], ...posts.map((p) => ['/blog/' + p.slug, '0.6', p.date]),
    ...(reviews.length ? [['/danh-gia', '0.6']] : []),
  ];
  const loc = (l, p) => { const [path, q] = p.split('?'); return base + localize(l, path) + (q ? '?' + q.replace(/&/g, '&amp;') : ''); };
  const links = (p) => LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${loc(l, p)}"/>`).join('') +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${loc('vi', p)}"/>`;
  const body = pages.flatMap(([p, pr]) => LANGS.map((l) => `<url><loc>${loc(l, p)}</loc>${links(p)}<priority>${pr}</priority></url>`)).join('') +
    viPages.map(([p, pr, d]) => `<url><loc>${base + p}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}<priority>${pr}</priority></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`);
});

app.use((req, res) => {
  res.locals.noindex = true;
  res.status(404).render('error', { title: req.t('errNotFoundTitle'), message: req.t('errNotFound') });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.noindex = true;
  res.status(500).render('error', { title: req.t('errServerTitle'), message: req.t('errServer') });
});

// Dọn ảnh của giỏ hàng bỏ dở (không thành đơn) mỗi 12 giờ.
const cleanupPhotos = () => photos.cleanup(new Set(db.get().orders.flatMap((o) => o.items.map((i) => i.uid).filter(Boolean))));
cleanupPhotos();
setInterval(cleanupPhotos, 12 * 60 * 60 * 1000).unref();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Kinie chạy tại http://localhost:${port}`));
