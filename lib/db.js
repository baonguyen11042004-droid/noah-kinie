const fs = require('fs');
const path = require('path');
const seed = require('../data/seed');

const FILE = path.join(__dirname, '..', 'data', 'db.json');
// Tăng số này khi đổi cấu trúc sản phẩm: sản phẩm được nạp lại từ seed, đơn hàng và tin nhắn được giữ nguyên.
const SCHEMA = 2;

let state;

function load() {
  if (state) return state;
  try {
    state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    state = { products: seed, orders: [], messages: [], seq: 1000, schema: SCHEMA };
    save();
  }
  if (state.schema !== SCHEMA) {
    state.products = seed;
    state.orders = state.orders || [];
    state.messages = state.messages || [];
    state.seq = state.seq || 1000;
    state.schema = SCHEMA;
    save();
  }
  return state;
}

function save() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

module.exports = {
  get: load,
  save,
  nextOrderCode() {
    const s = load();
    s.seq += 1;
    return 'KN' + s.seq;
  },
};
