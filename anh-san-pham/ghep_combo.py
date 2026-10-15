"""Ghép ảnh sản phẩm từng combo ảnh nam châm Kinie (5,5 x 8 cm, full ảnh, dày 3 mm, bóng).

Đầu vào: goc/mau-*.png (ảnh mẫu AI). Đầu ra: ra/anh-nam-cham-<N>.webp, 1200 x 1200.
Mỗi combo vẽ đúng số tấm: qty tấm + ảnh tặng (tấm tặng có nơ hồng ở góc).
Chạy: python ghep_combo.py
"""
import glob
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sorted(glob.glob(os.path.join(HERE, 'goc', 'mau-*.png')))
OUT = os.path.join(HERE, 'ra')
SIZE = 1200
RATIO = 55 / 80  # rộng / cao của một tấm
# (số ảnh, ảnh tặng) theo bảng giá data/seed.js
COMBOS = [(1, 0), (3, 0), (6, 0), (9, 0), (15, 0), (20, 0), (29, 1), (50, 2), (100, 3), (200, 5)]
ROSE = (232, 96, 138)
FONT = 'C:/Windows/Fonts/segoeuib.ttf'


def background():
    """Cửa tủ lạnh trắng: chuyển sắc nhẹ, ánh sáng từ trên trái."""
    bg = Image.new('RGB', (SIZE, SIZE), (247, 245, 243))
    px = bg.load()
    for y in range(SIZE):
        for x in range(SIZE):
            t = (x * 0.35 + y * 0.65) / SIZE
            v = int(250 - 16 * t)
            px[x, y] = (v, v - 1, v - 3)
    return bg


def crop_to_ratio(im, w, h):
    """Cắt giữa ảnh cho đúng tỉ lệ khung rồi thu về w x h."""
    iw, ih = im.size
    target = w / h
    if iw / ih > target:
        nw = int(ih * target)
        im = im.crop(((iw - nw) // 2, 0, (iw - nw) // 2 + nw, ih))
    else:
        nh = int(iw / target)
        top = int((ih - nh) * 0.35)  # giữ phần mặt người (thường ở nửa trên)
        im = im.crop((0, top, iw, top + nh))
    return im.resize((w, h), Image.LANCZOS)


def magnet(photo, w, h):
    """Một tấm nam châm: ảnh full, bo góc nhỏ, mép tối 3 mm, vệt bóng chéo."""
    edge = max(2, round(w * 3 / 55 * 0.45))  # mép nhìn thấy khi đặt hơi nghiêng
    r = max(2, round(w * 0.035))
    tile = Image.new('RGBA', (w + edge, h + edge), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    d.rounded_rectangle((edge, edge, w + edge - 1, h + edge - 1), r, fill=(40, 34, 36, 255))  # mép nam châm
    face = crop_to_ratio(photo, w, h).convert('RGBA')
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    # vệt bóng: dải sáng chéo mờ
    gloss = Image.new('L', (w, h), 0)
    gd = ImageDraw.Draw(gloss)
    gd.polygon([(0, int(h * 0.05)), (int(w * 0.55), 0), (int(w * 0.95), 0), (0, int(h * 0.42))], fill=60)
    gloss = gloss.filter(ImageFilter.GaussianBlur(max(1, w // 12)))
    face = Image.alpha_composite(face, Image.merge('RGBA', (*Image.new('RGB', (w, h), 'white').split(), gloss)))
    tile.paste(face, (0, 0), mask)
    return tile


def shadow_of(tile, blur):
    a = tile.split()[3]
    sh = Image.new('RGBA', tile.size, (60, 40, 45, 0))
    sh.putalpha(a.point(lambda v: int(v * 0.32)))
    pad = blur * 3
    big = Image.new('RGBA', (tile.width + pad * 2, tile.height + pad * 2), (0, 0, 0, 0))
    big.paste(sh, (pad, pad), sh)
    return big.filter(ImageFilter.GaussianBlur(blur)), pad


def ribbon(canvas, x, y, w):
    """Nơ hồng góc trên phải: đánh dấu ảnh tặng."""
    s = max(10, int(w * 0.32))
    d = ImageDraw.Draw(canvas)
    d.polygon([(x + w - s, y), (x + w, y), (x + w, y + s)], fill=ROSE + (255,))


GAP = 0.14  # khoảng cách giữa các tấm, tính theo bề rộng một tấm
AREA_W, AREA_H = SIZE * 0.86, SIZE * 0.76  # vùng đặt ảnh (chừa chỗ cho nhãn số lượng ở dưới)


def grid(n):
    """Chọn số cột, số hàng sao cho tấm to nhất; hoà thì ít ô trống hơn."""
    best = None
    for cols in range(1, n + 1):
        rows = math.ceil(n / cols)
        w = min(AREA_W / (cols + (cols - 1) * GAP),
                AREA_H / (rows / RATIO + (rows - 1) * GAP))
        score = (round(w, 1), -(cols * rows - n))
        if best is None or score > best[0]:
            best = (score, cols, rows, w)
    return best[1], best[2], best[3]


def badge(canvas, text, xy, fill, fg, size):
    font = ImageFont.truetype(FONT, size)
    d = ImageDraw.Draw(canvas)
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    pw, ph = r - l + size, b - t + size * 0.7
    x, y = xy
    d.rounded_rectangle((x, y, x + pw, y + ph), ph / 2, fill=fill)
    d.text((x + size / 2 - l, y + (ph - (b - t)) / 2 - t), text, font=font, fill=fg)
    return pw


def build(qty, gift, photos):
    total = qty + gift
    canvas = background().convert('RGBA')
    rnd = random.Random(qty)
    cols, rows, wf = grid(total)
    if total == 1:
        wf = SIZE * 0.44  # một tấm: không cần to hết khung
    w = int(wf)
    h = int(w / RATIO)
    gx = w * (1 + GAP)
    gy = h + w * GAP
    ox = (SIZE - (gx * cols - w * GAP)) / 2
    oy = (SIZE - (gy * rows - w * GAP)) / 2 - SIZE * 0.04
    blur = max(2, w // 18)
    # Xáo ảnh theo từng combo; mỗi vòng 10 ảnh đều khác nhau, nối vòng sao cho hai tấm liền nhau không trùng.
    order = []
    while len(order) < total:
        batch = list(range(len(photos)))
        rnd.shuffle(batch)
        if order and batch[0] == order[-1]:
            batch.append(batch.pop(0))
        order += batch
    for k in range(total):
        r_, c_ = divmod(k, cols)
        # hàng cuối chưa đầy: căn giữa
        in_row = cols if r_ < rows - 1 else total - cols * (rows - 1)
        shift = (cols - in_row) * gx / 2
        x = ox + c_ * gx + shift
        y = oy + r_ * gy
        photo = photos[order[k]]
        tile = magnet(photo, w, h)
        angle = rnd.uniform(-2.2, 2.2) if total <= 20 else 0
        if total == 1:
            angle = -3
        tile = tile.rotate(angle, resample=Image.BICUBIC, expand=True)
        sh, pad = shadow_of(tile, blur)
        canvas.alpha_composite(sh, (int(x - pad + blur * 0.6), int(y - pad + blur * 0.9)))
        canvas.alpha_composite(tile, (int(x), int(y)))
        if k >= qty:
            ribbon(canvas, int(x), int(y), w)
    fs = 54
    bx = badge(canvas, '×' + str(qty), (40, SIZE - 40 - fs * 1.7), (255, 255, 255), ROSE, fs)
    if gift:
        badge(canvas, '+' + str(gift), (40 + bx + 18, SIZE - 40 - fs * 1.7), ROSE, (255, 255, 255), fs)
    return canvas.convert('RGB')


def main():
    os.makedirs(OUT, exist_ok=True)
    photos = [Image.open(f).convert('RGB') for f in SRC]
    for qty, gift in COMBOS:
        im = build(qty, gift, photos)
        p = os.path.join(OUT, f'anh-nam-cham-{qty}.webp')
        im.save(p, 'WEBP', quality=84, method=6)
        print(os.path.basename(p), os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    main()
