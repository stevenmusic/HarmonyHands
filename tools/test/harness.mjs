// 共用:開啟頁面,攔截 jsdelivr(OSMD 換本機)、raw.githubusercontent(取樣用 curl 下載後快取在本機)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const CACHE = path.resolve("samplecache");
fs.mkdirSync(CACHE, { recursive: true });
export async function open(opts = {}){
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1400, height: 900 }, deviceScaleFactor: opts.dpr || 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("[pageerror] " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("[console] " + m.text()); });
  await page.route(/cdn\.jsdelivr\.net\/npm\/opensheetmusicdisplay/, r => r.fulfill({ path: require.resolve("opensheetmusicdisplay/build/opensheetmusicdisplay.min.js"), contentType: "text/javascript", headers: { "access-control-allow-origin": "*" } }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/raw\.githubusercontent\.com/, async r => {
    const url = r.request().url(), f = path.join(CACHE, url.replace(/^https:\/\/raw\.githubusercontent\.com\//, "").replace(/\//g, "__"));
    if (!fs.existsSync(f)) { try { execFileSync("curl", ["-sSfL", "-o", f, url]); } catch (e) { return r.fulfill({ status: 404, body: "" }); } }
    r.fulfill({ path: f, headers: { "access-control-allow-origin": "*", "content-type": url.endsWith(".json") ? "application/json" : "audio/flac" } });
  });
  await page.goto("file://" + path.resolve(opts.file || process.env.HH_FILE || new URL("../../index.html", import.meta.url).pathname));
  await page.waitForFunction(() => window.__stageReady >= 1, null, { timeout: 60000 });
  return { browser, page, errors };
}
