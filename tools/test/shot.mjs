import { open } from "./harness.mjs";
const OUT = process.env.OUT || "./";
for (const [name, vp, mobile] of [["desktop", { width: 1400, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  for (const [inst, style, tonic, lang, light] of [["piano", "pop", "C", "zh", false], ["guitar", "blues", "F", "zh", true]]) {
    const { browser, page, errors } = await open({ viewport: vp, mobile, dpr: mobile ? 2 : 1 });
    await page.evaluate(async ([inst, style, tonic, lang, light]) => {
      try { localStorage.setItem(THEME_KEY, light ? "light" : "dark"); } catch (e) {}
      applyTheme();
      Object.assign(state, { inst, style, prog: 0, tonic, pattern: "", tempo: 0, countIn: false });
      applyLanguage(lang);
      const before = window.__scoreReady; regenerate({ now: true });
      while (window.__scoreReady === before) await new Promise(r => setTimeout(r, 30));
    }, [inst, style, tonic, lang, light]);
    await page.click("#playBtn");
    await page.waitForFunction(() => cursorIdx >= 6, null, { timeout: 60000 });
    const st = await page.evaluate(() => ({ cursorIdx, hl: [...document.querySelectorAll(".chip.on,.gcard.on")].map(e => e.textContent.slice(0, 12)),
      status: $("status").textContent, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, t: audioCtx.currentTime.toFixed(2) }));
    console.log(name, inst, JSON.stringify(st));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${OUT}${name}-${inst}-playing.png`, fullPage: !mobile });
    await page.click("#playBtn"); await page.waitForTimeout(400); await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${OUT}${name}-${inst}.png`, fullPage: !mobile });
    if (mobile) {
      await page.evaluate(() => window.scrollTo(0, $("scoreCard").offsetTop - 50)); await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}${name}-${inst}-score.png` });
      await page.evaluate(() => window.scrollTo(0, $("guideCard").offsetTop - 50)); await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}${name}-${inst}-guide.png` });
    }
    console.log("errors", errors.filter(e => !/ERR_FAILED/.test(e)));
    await browser.close();
  }
}
