// 產生器全面檢查(不畫譜,很快):全部風格 × 進行 × 型態(鋼琴左右手所有組合)× 12 個調
// - MusicXML 能解析、每個聲部每小節時值剛好 16、連桿 begin/end 成對、音名升降不超過兩個(G♯ 小調的 F𝄪 是對的)
// - 兩隻手不撞:每小節左手最高音 < 右手最低音
// - 行走低音:每小節最後一個音跟下一小節第一個音差半音
import { open } from "./harness.mjs";
const { browser, page } = await open();
const r = await page.evaluate(() => {
  const bad = []; let count = 0;
  const seen = new Set(), push = m => { const k = m.replace(/ [A-G][#b]? /, " ").replace(/bar\d+|m\d+/g, ""); if (seen.has(k)) return; seen.add(k); if (bad.length < 60) bad.push(m); };
  for (const st of ACC_STYLES) st.progs.forEach((pr, pi) => {
    const keys = ACC_KEYS[pr.minor ? "minor" : "major"].map(k => k[0]);
    const combos = [];
    for (const lh of st.piano.lh) for (const rh of st.piano.rh) combos.push({ inst: "piano", lh, rh });
    for (const g of st.guitar) combos.push({ inst: "guitar", gpat: g });
    for (const c of combos) for (const tonic of keys) {
      const opts = { style: st.id, prog: pi, tonic, tempo: 90, loops: 2, ...c };
      const g = accGenerate(opts); count++;
      const tag = `${c.inst} ${st.id}#${pi} ${c.lh || c.gpat}${c.rh ? "+" + c.rh : ""} ${tonic}`;
      if (c.inst === "piano" && (g.guide.lh !== c.lh || g.guide.rh !== c.rh)) push(tag + " pattern not applied");
      const doc = new DOMParser().parseFromString(g.xml, "application/xml");
      if (doc.querySelector("parsererror")) { push(tag + " parse"); continue; }
      doc.querySelectorAll("alter").forEach(a => { if (Math.abs(+a.textContent) > 2) push(tag + " alter " + a.textContent); });
      doc.querySelectorAll("measure").forEach(m => {
        const sum = {}, open = {};
        m.querySelectorAll("note").forEach(n => {
          if (n.querySelector("chord")) return;
          const v = n.querySelector("voice").textContent; sum[v] = (sum[v] || 0) + +n.querySelector("duration").textContent;
          const b = n.querySelector('beam[number="1"]');
          if (b) { if (b.textContent === "begin") { if (open[v]) push(tag + " beam nested"); open[v] = 1; } if (b.textContent === "end") { if (!open[v]) push(tag + " beam end"); open[v] = 0; } }
        });
        for (const [v, d] of Object.entries(sum)) if (d !== 16) push(`${tag} m${m.getAttribute("number")} v${v}=${d}`);
        for (const [v, o] of Object.entries(open)) if (o) push(`${tag} m${m.getAttribute("number")} beam open v${v}`);
      });
      if (c.inst === "piano") g.bars.forEach((b, i) => {
        const L = b.notes.filter(n => n.hand === "L").map(n => n.midi), R = b.notes.filter(n => n.hand === "R").map(n => n.midi);
        if (!L.length || !R.length) push(`${tag} bar${i} empty hand`);
        else if (Math.max(...L) >= Math.min(...R)) push(`${tag} bar${i} hands collide L${Math.max(...L)} R${Math.min(...R)}`);
        if (Math.min(...L) < 28) push(`${tag} bar${i} LH too low ${Math.min(...L)}`);
        if (c.lh === "walking" && i + 1 < g.bars.length - 1) {
          const last = b.notes.filter(n => n.hand === "L" && n.at === 12)[0], nx = g.bars[i + 1].notes.filter(n => n.hand === "L" && n.at === 0)[0];
          if (last && nx && Math.abs(last.midi - nx.midi) !== 1) push(`${tag} bar${i} walking approach ${last.midi}->${nx.midi}`);
        }
      });
    }
  });
  return { count, bad };
});
console.log("generated:", r.count, "problems:", r.bad.length, r.bad.slice(0, 40));
await browser.close();
