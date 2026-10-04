// 重建 index.html 的 GTR_ADV(進階和弦的吉他指型表)。
// 指型用 HarmonyMap 的指法引擎算(chordVoicingsFor:公開和弦資料庫交叉比對 + 窮舉評分,跟 HarmonyMap 網頁推薦的一樣),
// 左手手指用 HarmonyMap 的 gtrFingering(FINGER_BOOK)。需要的和弦從 HarmonyHands 自己的 ACC_STYLES 算出來(所有用到 GTR_ADV 的和弦 × 12 個根音)。
// 用法:node tools/build/gtr_adv.mjs [HarmonyMap 的 index.html](預設 ../harmonymap/index.html 或環境變數 HM_INDEX)
// 需要 tools/test 的 playwright(cd tools/test && npm i)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../test/package.json"));
const { chromium } = require("playwright");
const HH = path.resolve(here, "../../index.html");
const HM = path.resolve(process.argv[2] || process.env.HM_INDEX || path.join(here, "../../../harmonymap/index.html"));
if (!fs.existsSync(HM)) { console.error("找不到 HarmonyMap index.html:" + HM); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage();
await page.route(/^https?:\/\//, r => r.abort());
// 1. HarmonyHands:哪些(和弦種類 id, 低音半音)會用到 GTR_ADV
await page.goto("file://" + HH);
const needs = await page.evaluate(() => {
  const out = new Set();
  const key = accKeyFor(false, "C"), keyM = accKeyFor(true, "A");
  for (const st of ACC_STYLES) for (const p of st.progs) {
    const k = p.minor ? keyM : key, adv = p.lv === "a";
    for (const r of p.ch.split(" ").concat([accEndRoman(st, p)])) {
      const ch = accRealize(accParseRoman(r), k);
      if (accGtrUsesTable(ch, adv)) out.add(ch.id + "|" + ch.bassIv);
    }
  }
  return [...out].sort();
});
// 2. HarmonyMap:每一組 × 12 個根音的指型(推薦的在前,最多 3 個)與手指
await page.goto("file://" + HM);
const table = await page.evaluate(needs => {
  const out = {}, miss = [];
  const c36 = f => f < 0 ? "x" : f.toString(36);
  for (const k of needs) {
    const [id, biv] = k.split("|"), bassIv = +biv, def = CHORDS.find(c => c.id === id);
    if (!def) { miss.push(k + "(HarmonyMap 沒有這種和弦)"); continue; }
    out[k] = [];
    for (let r = 0; r < 12; r++) {
      const res = chordVoicingsFor(r, def, bassIv ? (r + bassIv) % 12 : null);
      const list = res.best >= 0 ? [res.list[res.best]].concat(res.list.filter((_, i) => i !== res.best)) : res.list;
      if (!list.length) miss.push(k + " 根音 " + r);
      out[k].push(list.slice(0, 3).map(v => v.frets.map(c36).join("") + ":" + gtrFingering(v.frets).map(x => x == null ? "." : x).join("")).join(" "));
    }
  }
  return { out, miss };
}, needs);
await browser.close();
if (table.miss.length) { console.error("缺指型:\n" + table.miss.join("\n")); process.exit(1); }
const line = "const GTR_ADV = " + JSON.stringify(table.out).replace(/\],"/g, '],\n  "').replace(/^\{/, "{\n  ").replace(/\}$/, "\n}") + ";";
const src = fs.readFileSync(HH, "utf8");
const re = /const GTR_ADV = \{[\s\S]*?\n?\};/;
if (!re.test(src)) { console.error("index.html 裡找不到 const GTR_ADV"); process.exit(1); }
fs.writeFileSync(HH, src.replace(re, line));
console.log(`GTR_ADV:${needs.length} 組 × 12 個根音,寫回 ${HH}`);
