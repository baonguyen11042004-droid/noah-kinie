// Vẽ ảnh minh hoạ sản phẩm bằng SVG (dùng khi chưa có ảnh thật).
function artSvg(p) {
  const h = Number(p.hue) || 350;
  const c1 = `hsl(${h} 70% 88%)`;
  const c2 = `hsl(${(h + 30) % 360} 65% 78%)`;
  const c3 = `hsl(${(h + 340) % 360} 55% 68%)`;
  const scene = (x, y, w, hgt, r = 6, id = 'a') => `
    <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="${r}"/></clipPath>
    <g clip-path="url(#${id})">
      <rect x="${x}" y="${y}" width="${w}" height="${hgt}" fill="url(#sky)"/>
      <circle cx="${x + w * 0.7}" cy="${y + hgt * 0.32}" r="${w * 0.13}" fill="#fffafc" opacity=".9"/>
      <path d="M${x} ${y + hgt} L${x} ${y + hgt * 0.68} Q${x + w * 0.3} ${y + hgt * 0.5} ${x + w * 0.55} ${y + hgt * 0.7} T${x + w} ${y + hgt * 0.62} L${x + w} ${y + hgt}Z" fill="${c3}" opacity=".85"/>
      <path d="M${x} ${y + hgt} L${x} ${y + hgt * 0.82} Q${x + w * 0.4} ${y + hgt * 0.66} ${x + w} ${y + hgt * 0.85} L${x + w} ${y + hgt}Z" fill="hsl(${h} 45% 60%)" opacity=".9"/>
    </g>`;
  let body;
  if (p.category === 'tron') {
    body = `<circle cx="200" cy="200" r="130" fill="#fffafc" stroke="#f6cfdb" stroke-width="3"/>
      <clipPath id="c"><circle cx="200" cy="200" r="112"/></clipPath>
      <g clip-path="url(#c)"><rect x="80" y="80" width="240" height="240" fill="url(#sky)"/>
      <circle cx="255" cy="150" r="30" fill="#fffafc" opacity=".9"/>
      <path d="M80 320V245Q150 190 210 250T320 235V320Z" fill="${c3}"/><path d="M80 320V285Q200 240 320 290V320Z" fill="hsl(${h} 45% 60%)"/></g>`;
  } else if (p.category === 'vuong') {
    const cells = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cells.push(scene(58 + j * 100, 58 + i * 100, 88, 88, 8, `s${i}${j}`));
    body = `<rect x="40" y="40" width="320" height="320" rx="16" fill="#fffafc" stroke="#f6cfdb" stroke-width="3"/>${cells.join('')}`;
  } else if (p.category === 'acrylic') {
    body = `<rect x="90" y="60" width="220" height="290" rx="22" fill="#fff" fill-opacity=".55" stroke="hsl(${h} 60% 80%)" stroke-width="4"/>
      ${scene(108, 78, 184, 200, 12, 'ac')}<path d="M118 90 L170 90 L118 150Z" fill="#fff" opacity=".45"/>`;
  } else if (p.category === 'qua-tang') {
    body = `<rect x="60" y="150" width="280" height="190" rx="14" fill="hsl(${h} 45% 82%)"/>
      <rect x="50" y="120" width="300" height="50" rx="10" fill="hsl(${h} 55% 72%)"/>
      <rect x="188" y="120" width="24" height="220" fill="#fffafc" opacity=".9"/>
      <path d="M200 120c-40-60-90-30-60 0zM200 120c40-60 90-30 60 0z" fill="#fffafc"/>
      <g transform="rotate(-8 130 90)">${scene(95, 40, 70, 60, 4, 'g1')}</g>`;
  } else {
    body = `<g transform="rotate(-4 200 200)"><rect x="70" y="50" width="260" height="300" rx="10" fill="#fffafc" stroke="#f6cfdb" stroke-width="3"/>
      ${scene(88, 68, 224, 224, 6, 'p')}
      <path d="M200 322c-14-10-24-18-24-28a12 12 0 0 1 24-3 12 12 0 0 1 24 3c0 10-10 18-24 28z" fill="${c3}" transform="translate(0 -8) scale(1)"/></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="bg"><stop offset="0" stop-color="#fff5f8"/><stop offset="1" stop-color="#fbe3ea"/></radialGradient></defs>
    <rect width="400" height="400" fill="url(#bg)"/>
    <g filter="drop-shadow(0 8px 10px rgba(180,110,100,.25))">${body}</g></svg>`;
}
module.exports = { artSvg };
