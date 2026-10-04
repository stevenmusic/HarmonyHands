// MusicXML 結構檢查:每個聲部每小節時值剛好 16、連桿 begin/end 成對
import { open } from "./harness.mjs";
const { browser, page } = await open();
const r = await page.evaluate(() => {
  const bad = [];
  for (const inst of ["piano", "guitar"]) for (const st of ACC_STYLES) for (let p = 0; p < st.progs.length; p++) for (const pat of Object.keys(inst === "piano" ? ACC_PIANO_PATTERNS : ACC_GTR_PATTERNS)) {
    Object.assign(state, { inst, style: st.id, prog: p, pattern: pat, tempo: 0, tonic: st.minor ? "A" : "C" });
    const g = accGenerate(state), doc = new DOMParser().parseFromString(g.xml, "application/xml");
    if (doc.querySelector("parsererror")) { bad.push(inst + st.id + "parse"); continue; }
    doc.querySelectorAll("measure").forEach(m => {
      const sum = {}; let open = {};
      m.querySelectorAll("note").forEach(n => {
        if (n.querySelector("chord")) return;
        const v = n.querySelector("voice").textContent; sum[v] = (sum[v] || 0) + +n.querySelector("duration").textContent;
        const b = n.querySelector('beam[number="1"]');
        if (b) { if (b.textContent === "begin") { if (open[v]) bad.push("beam nested"); open[v] = 1; } if (b.textContent === "end") { if (!open[v]) bad.push("beam end"); open[v] = 0; } }
      });
      for (const [v, d] of Object.entries(sum)) if (d !== 16) bad.push(`${inst} ${st.id} ${pat} m${m.getAttribute("number")} v${v}=${d}`);
      for (const [v, o] of Object.entries(open)) if (o) bad.push(`${inst} ${st.id} ${pat} m${m.getAttribute("number")} beam open v${v}`);
    });
  }
  return bad;
});
console.log("xml problems:", r.length, r.slice(0, 10));
await browser.close();
