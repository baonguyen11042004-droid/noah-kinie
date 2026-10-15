"""Tờ xem trước bộ ảnh sản phẩm cho CEO duyệt: anh-san-pham/xem-truoc.jpg"""
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(HERE, '..', 'public', 'img', 'sp')
F = 'C:/Windows/Fonts/segoeuib.ttf'
W = 1800
T = 340  # cỡ một ô combo
title = ImageFont.truetype(F, 40)
label = ImageFont.truetype(F, 26)

combos = [1, 3, 6, 9, 15, 20, 29, 50, 100, 200]
H = 90 + 2 * (T + 50) + 90 + 520 + 60
sheet = Image.new('RGB', (W, H), (250, 244, 246))
d = ImageDraw.Draw(sheet)

y = 30
d.text((40, y), '1. Ảnh từng combo (thẻ sản phẩm + trang sản phẩm)', font=title, fill=(90, 42, 60))
y += 70
gap = (W - 80 - 5 * T) // 4
for i, n in enumerate(combos):
    x = 40 + (i % 5) * (T + gap)
    yy = y + (i // 5) * (T + 50)
    sheet.paste(Image.open(os.path.join(SP, f'anh-nam-cham-{n}.webp')).convert('RGB').resize((T, T)), (x, yy))
    d.text((x, yy + T + 8), f'Combo {n} ảnh', font=label, fill=(138, 90, 108))

y += 2 * (T + 50) + 20
d.text((40, y), '2. Trang chủ: 3 khung "Ảnh của bạn"', font=title, fill=(90, 42, 60))
d.text((760, y), '3. Trang Về Kinie', font=title, fill=(90, 42, 60))
d.text((1280, y), '4. Trang sản phẩm', font=title, fill=(90, 42, 60))
y += 70
x = 40
for name in ['mau-em-be', 'mau-cap-doi', 'mau-gia-dinh']:
    im = Image.open(os.path.join(SP, name + '.webp')).convert('RGB').resize((220, 320))
    sheet.paste(im, (x, y + 60))
    x += 240
for name, x0 in [('tu-lanh', 760), ('cam-tay', 1280)]:
    im = Image.open(os.path.join(SP, name + '.webp')).convert('RGB').resize((416, 520))
    sheet.paste(im, (x0, y))

out = os.path.join(HERE, 'xem-truoc.jpg')
sheet.save(out, quality=88)
print('xem-truoc.jpg', sheet.size, os.path.getsize(out) // 1024, 'KB')
