"""Xuất ảnh sản phẩm sang public/img/sp/ đúng cỡ hiển thị trên web (webp).

- anh-nam-cham-<N>.webp: 800 x 800 (thẻ sản phẩm 400 px, trang sản phẩm 600 px)
- mau-*.webp: 3 ảnh mẫu cho khung "Ảnh của bạn" ở trang chủ, tỉ lệ 55:80
- tu-lanh.webp, cam-tay.webp: ảnh đời thường, 900 x 1125
Chạy sau ghep_combo.py: python xuat_web.py
"""
import glob
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(HERE, '..', 'public', 'img', 'sp')
HERO = {'mau-cap-doi': 'mau-02-cap-doi', 'mau-em-be': 'mau-03-em-be', 'mau-gia-dinh': 'mau-01-gia-dinh'}
LIFE = {'tu-lanh': 'doi-song-tu-lanh', 'cam-tay': 'doi-song-cam-tay'}


def crop(im, ratio, top_bias=0.35):
    w, h = im.size
    if w / h > ratio:
        nw = int(h * ratio)
        return im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    nh = int(w / ratio)
    t = int((h - nh) * top_bias)
    return im.crop((0, t, w, t + nh))


def save(im, name, size):
    im = im.convert('RGB').resize(size, Image.LANCZOS)
    p = os.path.join(DEST, name + '.webp')
    im.save(p, 'WEBP', quality=82, method=6)
    print(name + '.webp', size, os.path.getsize(p) // 1024, 'KB')


def main():
    os.makedirs(DEST, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(HERE, 'ra', 'anh-nam-cham-*.webp'))):
        save(Image.open(f), os.path.splitext(os.path.basename(f))[0], (800, 800))
    for out, src in HERO.items():
        save(crop(Image.open(os.path.join(HERE, 'goc', src + '.png')), 55 / 80), out, (440, 640))
    for out, src in LIFE.items():
        save(crop(Image.open(os.path.join(HERE, 'goc', src + '.png')), 4 / 5), out, (900, 1125))


if __name__ == '__main__':
    main()
