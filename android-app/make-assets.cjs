const sharp = require('sharp');
const QRCode = require('qrcode');
const path = require('path');
const src = path.resolve(__dirname, '../mobile icon.png');
const res = path.resolve(__dirname, 'android/app/src/main/res');
const pub = path.resolve(__dirname, '../public');
const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
(async () => {
  // rounded-square tile (drop shadow excluded) for legacy / install page icon
  const tile = await sharp(src).extract({ left: 80, top: 80, width: 1095, height: 1095 }).toBuffer();
  for (const [d, s] of Object.entries(sizes)) {
    const out = path.join(res, `mipmap-${d}`);
    await sharp(tile).resize(s, s).toFile(path.join(out, 'ic_launcher.png'));
    await sharp(tile).resize(s, s).toFile(path.join(out, 'ic_launcher_round.png'));
    // adaptive foreground: 108dp canvas, glyph inside the 66dp safe zone
    const f = Math.round(s * 108 / 48);
    const glyph = await sharp(src).extract({ left: 190, top: 340, width: 950, height: 590 })
      .resize({ width: Math.round(f * 0.56) }).toBuffer();
    await sharp({ create: { width: f, height: f, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: glyph, gravity: 'center' }]).png().toFile(path.join(out, 'ic_launcher_foreground.png'));
  }
  await sharp(tile).resize(512, 512).png().toFile(path.join(pub, 'app-icon.png'));
  await QRCode.toFile(path.join(pub, 'install-qr.png'), 'https://miceday.co.kr/install',
    { width: 400, margin: 1, color: { dark: '#0f3d1e', light: '#ffffff' } });
  console.log('ok');
})();
