// 用法:node render.mjs inst style prog tonic sec out.wav
import { open } from "./harness.mjs";
import fs from "node:fs";
const [inst, style, prog, tonic, sec, out] = process.argv.slice(2);
const { browser, page, errors } = await open();
const info = await page.evaluate(async ([inst, style, prog, tonic]) => {
  Object.assign(state, { inst, style, prog: +prog, tonic, lh: "", rh: "", gpat: "", tempo: 0 });
  renderControls(); regenerate({ now: true });
  // D 和弦/吉他音高檢查:每個音 = 空弦 + 格數 + capo
  const g = curGen, bad = [];
  if (inst === "guitar") for (const b of g.bars) for (const n of b.notes) if (n.midi !== ACC_GTR_OPEN_MIDI[n.str] + b.shape.frets[n.str] + g.guide.capo) bad.push(n);
  return { title: g.title, tempo: state.tempo, bad: bad.length };
}, [inst, style, prog, tonic]);
const t0 = Date.now();
const b64 = await page.evaluate(async sec => {
  const buf = await renderOffline(+sec);
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
  const ab = new ArrayBuffer(44 + n * 8), v = new DataView(ab);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 8, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 3, true); v.setUint16(22, 2, true);
  v.setUint32(24, buf.sampleRate, true); v.setUint32(28, buf.sampleRate * 8, true); v.setUint16(32, 8, true); v.setUint16(34, 32, true); w(36, "data"); v.setUint32(40, n * 8, true);
  for (let i = 0; i < n; i++) { v.setFloat32(44 + i * 8, L[i], true); v.setFloat32(48 + i * 8, R[i], true); }
  let s = ""; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}, sec);
fs.writeFileSync(out, Buffer.from(b64, "base64"));
console.log(JSON.stringify(info), "render", ((Date.now() - t0) / 1000).toFixed(1) + "s", errors.filter(e => !/ERR_FAILED/.test(e)));
await browser.close();
