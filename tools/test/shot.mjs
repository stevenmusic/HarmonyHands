// 桌機 1400×900 / 手機 390×844:播放中截圖(練習卡片、亮鍵、節奏格),停止後截頂部,打開樂譜截一張
import { open } from "./harness.mjs";
const OUT = process.env.OUT || "./";
const only = process.argv[2];
for (const [name, vp, mobile] of [["desktop", { width: 1400, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true], ["landscape", { width: 844, height: 390 }, true]]) {
  for (const [inst, style, tonic, light] of [["piano", "pop", "C", false], ["guitar", "blues", "F", true]]) {
    if (only && only !== name) continue;
    const { browser, page, errors } = await open({ viewport: vp, mobile, dpr: mobile ? 2 : 1 });
    await page.evaluate(async ([inst, style, tonic, light]) => {
      try { localStorage.setItem(THEME_KEY, light ? "light" : "dark"); } catch (e) {}
      applyTheme();
      Object.assign(state, { inst, style, prog: 0, tonic, pattern: "", tempo: 0, countIn: false, showScore: false });
      applyScoreToggle(); renderControls(); regenerate({ now: true });
    }, [inst, style, tonic, light]);
    await page.click("#playBtn");
    await page.waitForFunction(() => timeline.length >= 3 && hlStep >= 2 && hitSig && gridCell >= 2, null, { timeout: 60000 });
    await page.waitForTimeout(700);
    const st = await page.evaluate(() => ({ step: hlStep, cell: gridCell, hits: document.querySelectorAll("#stageRow .hit").length,
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, stageTop: Math.round($("stageCard").getBoundingClientRect().top) }));
    console.log(name, inst, JSON.stringify(st));
    await page.screenshot({ path: `${OUT}${name}-${inst}-playing.png`, fullPage: name === "desktop" });
    await page.click("#stagePlay"); await page.waitForTimeout(300);
    if (name !== "desktop") {
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
      await page.screenshot({ path: `${OUT}${name}-${inst}-top.png` });
    }
    if (name !== "landscape") {
      await page.evaluate(async () => { const b = window.__scoreReady || 0; $("scoreToggle").click(); while ((window.__scoreReady || 0) === b) await new Promise(r => setTimeout(r, 50)); });
      await page.evaluate(() => window.scrollTo(0, $("scoreCard").offsetTop - 60)); await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}${name}-${inst}-score.png` });
    }
    console.log("errors", errors.filter(e => !/ERR_FAILED/.test(e)));
    await browser.close();
  }
}
