// 樂譜截圖:各種型態各一張(打開樂譜,截第一、二行)
import { open } from "./harness.mjs";
const OUT = process.env.OUT || "./";
const cases = (process.argv[2] ? [process.argv.slice(2)] : [
  ["piano", "pop", "0", "C", ""], ["piano", "ballad", "1", "D", "broken1510+arp"], ["piano", "folk", "0", "G", ""], ["piano", "rock", "2", "E", ""],
  ["piano", "blues", "0", "F", ""], ["piano", "jazz", "0", "Bb", ""], ["piano", "latin", "0", "C", ""],
  ["guitar", "pop", "0", "C", ""], ["guitar", "folk", "0", "G", "travis"], ["guitar", "jazz", "1", "C", "comp4"], ["guitar", "latin", "0", "C", ""], ["guitar", "ballad", "0", "C", ""]]);
const { browser, page, errors } = await open({ viewport: { width: 1400, height: 900 } });
for (const [inst, style, prog, tonic, pattern] of cases) {
  await page.evaluate(async ([inst, style, prog, tonic, pattern]) => {
    const [pa, pb] = (pattern || "").split("+");
    Object.assign(state, { inst, style, prog: +prog, tonic, lh: inst === "piano" ? pa || "" : "", rh: pb || "", gpat: inst === "guitar" ? pa || "" : "", tempo: 0, showScore: true, loops: 1 });
    applyScoreToggle(); renderControls();
    const b = window.__scoreReady || 0; regenerate({ now: true });
    while ((window.__scoreReady || 0) === b) await new Promise(r => setTimeout(r, 40));
    window.scrollTo(0, $("paper").getBoundingClientRect().top + scrollY - 70);
  }, [inst, style, prog, tonic, pattern]);
  await page.waitForTimeout(250);
  const box = await page.evaluate(() => { const r = $("paper").getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, 820) }; });
  await page.screenshot({ path: `${OUT}score-${inst}-${style}${pattern ? "-" + pattern : ""}.png`, clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
}
console.log("errors", errors.filter(e => !/ERR_FAILED/.test(e)));
await browser.close();
