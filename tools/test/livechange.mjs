// 播放中換調/型態/速度/反覆次數:音樂不停,下一小節起照新的設定
import { open } from "./harness.mjs";
const { browser, page, errors } = await open({ viewport: { width: 1400, height: 900 } });
const snap = () => page.evaluate(() => ({ playing, key: curGen.guide.keyName, tl: timeline.length, bars: curGen.bars.length, nextBar,
  lastNotes: (() => { const x = timeline[timeline.length - 1]; return x ? curGen.bars[x.bi].notes.slice(0, 3).map(n => n.midi) : []; })() }));
const out = {};
for (const inst of (process.argv[2] ? [process.argv[2]] : ["piano", "guitar"])) {
  await page.evaluate(i => { Object.assign(state, { inst: i, style: "pop", prog: 0, tonic: "C", lh: "", rh: "", gpat: "", tempo: 120, countIn: false, loops: 2 }); renderControls(); regenerate({ now: true }); }, inst);
  await page.click("#playBtn");
  await page.waitForFunction(() => timeline.length >= 2, null, { timeout: 60000 });
  const a = await snap();
  await page.selectOption("#selKey", "D");
  await page.waitForTimeout(2500);
  const b = await snap();
  await page.selectOption(inst === "piano" ? "#selLH" : "#selGtr", inst === "piano" ? "broken158" : "arp8");
  await page.click("#tempoUp");
  await page.selectOption("#selLoops", "1");
  await page.waitForTimeout(2500);
  const c = await snap();
  out[inst] = { a, b, c };
  await page.click("#playBtn"); await page.waitForTimeout(300);
}
console.log(JSON.stringify(out, null, 1));
console.log("errors", errors.filter(e => !/ERR_FAILED/.test(e)));
await browser.close();
