// Khối "Cấu tạo 6 lớp" (3D, Three.js). three.js chỉ được tải khi khách cuộn gần tới khối, nên trang chủ không nặng thêm.
// Không có WebGL thì giữ nguyên ảnh tĩnh trong khối.
const scene3 = document.getElementById('ct-scene');
if (scene3) {
  new IntersectionObserver((es, ob) => {
    if (!es[0].isIntersecting) return;
    ob.disconnect();
    batDau();
  }, { rootMargin: '400px 0px' }).observe(scene3);
}

async function batDau() {
  if (!scene3.clientHeight) return;   // CSS chưa có (trình duyệt còn giữ style.css cũ) thì giữ ảnh tĩnh, không vẽ 3D lệch
  let THREE, RoomEnvironment;
  try {
    THREE = await import('/js/vendor/three.module.min.js');
    ({ RoomEnvironment } = await import('/js/vendor/RoomEnvironment.js'));
  } catch (e) { return; }

  const anh = document.getElementById('ct-anh');
  const nut = document.getElementById('ct-nut');
  const items = document.querySelectorAll('#ct-lop li');
  const giamChuyenDong = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) { return; }
  anh.loading = 'eager';   // khối sắp hiện: tải ảnh ngay, không chờ cơ chế lazy của trình duyệt
  if (!anh.complete) await new Promise(xong => { anh.onload = anh.onerror = xong; });
  if (!anh.naturalWidth) return;
  scene3.closest('.ct').classList.add('ct--3d');   // ẩn ảnh tĩnh, hiện nút và gợi ý

  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  scene3.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(28, 1, 1, 2000);
  const den = new THREE.DirectionalLight(0xffffff, 1.6);
  den.position.set(-60, 90, 160);
  den.castShadow = true;
  den.shadow.mapSize.set(1024, 1024);
  den.shadow.radius = 6;
  den.shadow.bias = -0.0008;
  den.shadow.normalBias = 0.3;   // chống vệt răng cưa (shadow acne) ở mép các lớp
  Object.assign(den.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 500 });
  scene.add(den, new THREE.AmbientLight(0xffffff, 0.25));

  // ---- Hình dạng (đơn vị: mm, tấm thật 55 × 80) ----
  function bo(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
    s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    return s;
  }
  function vat(w, h, c) {   // hình cắt vát 4 góc
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + c, y); s.lineTo(x + w - c, y); s.lineTo(x + w, y + c); s.lineTo(x + w, y + h - c);
    s.lineTo(x + w - c, y + h); s.lineTo(x + c, y + h); s.lineTo(x, y + h - c); s.lineTo(x, y + c); s.closePath();
    return s;
  }
  const dun = (shape, depth, bevel = 0) => new THREE.ExtrudeGeometry(shape, {
    depth, curveSegments: 24, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4
  });

  // ---- Bề mặt vẽ bằng canvas (UV của mặt phẳng = toạ độ mm) ----
  function beMat(w, h, ve, pxMm = 10) {
    const cv = document.createElement('canvas'); cv.width = Math.round(w * pxMm); cv.height = Math.round(h * pxMm);
    ve(cv.getContext('2d'), cv.width, cv.height);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    t.repeat.set(1 / w, 1 / h); t.offset.set(0.5, 0.5);
    return t;
  }
  const texAnh = beMat(62, 87, (g, W, H) => {   // ảnh in tràn lề để bọc qua viền khung
    const r = Math.max(W / anh.naturalWidth, H / anh.naturalHeight);
    const w = anh.naturalWidth * r, h = anh.naturalHeight * r;
    g.imageSmoothingQuality = 'high';
    g.drawImage(anh, (W - w) / 2, (H - h) / 2, w, h);
  }, 12);
  // không dùng mipmap cho ảnh: mipmap làm ảnh nhòe khi hiển thị nhỏ hơn kích thước gốc một chút
  texAnh.generateMipmaps = false; texAnh.minFilter = THREE.LinearFilter;
  const texDem = beMat(50.6, 75.6, (g, W, H) => {
    g.fillStyle = '#c4b8a3'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.22)' : 'rgba(90,70,40,.12)';
      g.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
    }
  });
  const texNamCham = beMat(55, 80, (g, W, H) => {
    g.fillStyle = '#303035'; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 14) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(x, 0, 6, H); }
  });

  const vl = {
    namCham: new THREE.MeshStandardMaterial({ map: texNamCham, roughness: .6, metalness: .15 }),
    namChamCanh: new THREE.MeshStandardMaterial({ color: 0x26262a, roughness: .7 }),
    dem: new THREE.MeshStandardMaterial({ map: texDem, roughness: .95 }),
    demCanh: new THREE.MeshStandardMaterial({ color: 0xbfb4a2, roughness: .95 }),
    khung: new THREE.MeshStandardMaterial({ color: 0xf2f4f7, metalness: .85, roughness: .22, envMapIntensity: 1.8 }),
    // mặt ảnh đã cán màng: bóng, rõ màu; toneMapped: false để giữ đúng màu và độ tương phản của ảnh gốc
    anh: new THREE.MeshPhysicalMaterial({ map: texAnh, roughness: .4, clearcoat: .6, clearcoatRoughness: .05, envMapIntensity: .3, toneMapped: false }),
    giay: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8 }),
    // màng bảo vệ mỏng, trong suốt: gần như không màu, chỉ thấy vệt phản chiếu
    mang: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .04, roughness: .02,
      metalness: 0, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide }),
    vien: () => new THREE.LineBasicMaterial({ color: 0x7c9fc4, transparent: true, opacity: 0 })
  };

  // ---- 6 lớp, từ dưới lên. z0 = vị trí khi ghép, s0 = co lại vừa khung khi ghép ----
  const chong = new THREE.Group();
  const nhom = new THREE.Group();
  nhom.add(chong); scene.add(nhom);

  function lop(so, z0, meshes, s0 = [1, 1], vienGeo = null) {
    const g = new THREE.Group();
    meshes.forEach(m => { m.userData.lop = so; g.add(m); });
    let vien = null;
    if (vienGeo) { vien = new THREE.LineSegments(new THREE.EdgesGeometry(vienGeo, 30), vl.vien()); g.add(vien); }
    chong.add(g);
    return { so, g, z0, s0, vien, lift: 0 };
  }
  const mesh = (geo, mat, bong = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = bong; m.receiveShadow = true; return m; };
  const dat = (m, z) => { m.position.z = z; return m; };

  const gNamCham = dun(bo(55, 80, 4), 0.6, 0.2);
  const gDem = dun(bo(50.6, 75.6, 2.2), 1.0, 0.1);   // vừa lọt lòng khung (lòng khung ~51 × 76)
  const vanh = bo(55, 80, 4); vanh.holes.push(bo(51.6, 76.6, 2.4));
  const gKhungDe = dun(bo(55, 80, 4), 0.25, 0.08);
  const gKhungVanh = dun(vanh, 1.0, 0.25);
  const gAnh = dun(vat(62, 87, 5), 0.2);
  const gMang2 = dun(bo(58, 83, 3), 0.12);
  const gMang1 = dun(vat(60, 85, 5), 0.15);

  const cacLop = [
    // z0 tính cả phần bo mép (bevel nhô ra hai mặt) để các lớp không đâm xuyên nhau khi ghép.
    // Khung form úp xuống: mặt phẳng ở trên đỡ ảnh, viền gờ gập xuống, lớp đệm lọt vào lòng khung từ dưới.
    lop(6, 0.0, [mesh(gNamCham, [vl.namCham, vl.namChamCanh])]),
    lop(5, 0.91, [mesh(gDem, [vl.dem, vl.demCanh])]),
    lop(4, 0.85, [dat(mesh(gKhungVanh, vl.khung), 0.25), dat(mesh(gKhungDe, vl.khung), 1.25)]),
    // lúc ghép, ảnh to hơn khung 0,4 mm để che kín viền (giấy ảnh bọc qua viền khung như tấm thật)
    lop(3, 2.5, [mesh(gAnh, [vl.anh, vl.giay])], [55.4 / 62, 80.4 / 87]),
    lop(2, 2.75, [mesh(gMang2, vl.mang(), false)], [55 / 58, 80 / 83], gMang2),
    lop(1, 2.92, [mesh(gMang1, vl.mang(), false)], [55 / 60, 80 / 85], gMang1)
  ];
  const tatCaMesh = [];
  chong.traverse(o => { if (o.isMesh) tatCaMesh.push(o); });

  // ---- Chuyển động: k = 0 ghép (ảnh đứng thẳng) → 1 tách thành tầng ----
  const TACH = 17;                       // khoảng cách giữa các tầng (mm)
  const GOC_X = -0.98, GOC_Z = 0.6;      // góc nhìn khi tách
  // smootherstep: vận tốc và gia tốc đều bằng 0 ở hai đầu nên không có cú giật khi bắt đầu/kết thúc
  const muot = t => t * t * t * (t * (t * 6 - 15) + 10);
  const kep = t => Math.min(1, Math.max(0, t));
  let k = 0, kDich = 0, chon = null;
  const nghieng = { x: 0, y: 0, dx: 0, dy: 0 };

  function capNhat(dt) {
    const tocDo = giamChuyenDong ? 99 : dt / 2.4, kTruoc = k;
    k += Math.sign(kDich - k) * Math.min(Math.abs(kDich - k), tocDo);
    const a = 1 - Math.exp(-dt * 7);     // làm mượt theo thời gian, không phụ thuộc số khung hình

    // xoay và tách gối lên nhau: khối đang nghiêng thì các lớp đã bắt đầu nâng
    const q = muot(kep(k / 0.6));
    nghieng.x += (nghieng.dx - nghieng.x) * a; nghieng.y += (nghieng.dy - nghieng.y) * a;
    let dangDong = k !== kTruoc || Math.abs(nghieng.dx - nghieng.x) > 1e-4 || Math.abs(nghieng.dy - nghieng.y) > 1e-4;
    nhom.rotation.set(GOC_X * q + nghieng.y * (1 - q), nghieng.x * (1 - q), GOC_Z * q);

    let zTren = 0;
    cacLop.forEach((L, i) => {
      const e = muot(kep((k - (0.2 + (5 - i) * 0.05)) / 0.55));
      const liftDich = chon === L.so && k > .95 ? 7 : 0;
      L.lift += (liftDich - L.lift) * a;
      if (Math.abs(liftDich - L.lift) > .01) dangDong = true;
      const zGoc = L.z0 + i * TACH * e;
      zTren = Math.max(zTren, zGoc);     // tâm khối tính theo vị trí gốc, lớp nhấc lên không kéo cả khối
      L.g.position.z = zGoc + L.lift;
      L.g.scale.set(L.s0[0] + (1 - L.s0[0]) * e, L.s0[1] + (1 - L.s0[1]) * e, 1);
      // màng chỉ lộ khi tách; lúc ghép ảnh nhìn trực tiếp, không bị mép màng vạch lên ảnh
      if (L.vien) { L.vien.material.opacity = 0.85 * e; L.g.children[0].material.opacity = 0.05 * e; }
    });
    chong.position.z = -zTren / 2;
    return dangDong;
  }

  // ---- Khung hình theo kích thước ô ----
  let canVe = true;
  function coKhung() {
    canVe = true;
    const w = scene3.clientWidth, h = scene3.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const can = Math.max(150 / 0.5, 125 / (0.5 * camera.aspect));   // đủ chỗ cho khối khi tách
    camera.position.set(0, 0, can * (camera.aspect < 1 ? 0.97 : 0.82));   // điện thoại lùi xa hơn để khỏi chạm mép
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(coKhung).observe(scene3);
  coKhung();

  // ---- Chỉ chạy khung hình khi khối đang hiện trên màn hình ----
  let dangHien = false, dangChay = false, last = performance.now();
  function vong(now) {
    if (!dangHien) { dangChay = false; return; }
    const dong = capNhat(Math.min(0.05, (now - last) / 1000)); last = now;
    if (dong || canVe) { renderer.render(scene, camera); canVe = false; }   // đứng yên thì không vẽ lại
    requestAnimationFrame(vong);
  }
  let daTuMo = false;
  new IntersectionObserver(es => {
    dangHien = es[0].isIntersecting;
    if (dangHien && !dangChay) { dangChay = true; last = performance.now(); requestAnimationFrame(vong); }
    if (dangHien && es[0].intersectionRatio > .45 && !daTuMo) { daTuMo = true; setTimeout(() => moRa(true), 1200); }
  }, { threshold: [0, .45] }).observe(scene3);

  // ---- Tương tác ----
  function moRa(mo) { kDich = mo ? 1 : 0; nut.textContent = mo ? nut.dataset.dong : nut.dataset.mo; if (!mo) danhDau(null); }
  function danhDau(so) { chon = so; items.forEach(li => li.classList.toggle('on', so !== null && li.dataset.lop == so)); }
  nut.addEventListener('click', () => moRa(kDich === 0));

  const ray = new THREE.Raycaster(), p = new THREE.Vector2();
  function trung(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    p.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(p, camera);
    const hit = ray.intersectObjects(tatCaMesh, false)[0];
    return { hit: hit ? hit.object.userData.lop : null, x: p.x, y: p.y };
  }
  renderer.domElement.addEventListener('pointermove', ev => {
    const t = trung(ev);
    nghieng.dx = t.x * 0.22; nghieng.dy = -t.y * 0.16;
    if (ev.pointerType === 'mouse' && k > .95) danhDau(t.hit);
    renderer.domElement.style.cursor = t.hit ? 'pointer' : 'default';
  });
  renderer.domElement.addEventListener('pointerleave', () => { nghieng.dx = nghieng.dy = 0; if (k > .95) danhDau(null); });
  renderer.domElement.addEventListener('click', ev => {
    const t = trung(ev);
    if (kDich === 0) return moRa(true);
    if (t.hit) danhDau(chon === t.hit ? null : t.hit); else moRa(false);
  });
  items.forEach(li => {
    const so = +li.dataset.lop;
    li.addEventListener('mouseenter', () => { if (kDich === 1) danhDau(so); });
    li.addEventListener('click', () => { if (kDich === 0) moRa(true); else danhDau(chon === so ? null : so); });
  });
  document.getElementById('ct-lop').addEventListener('mouseleave', () => danhDau(null));
}
