import { open } from "./harness.mjs";
const { browser, page, errors } = await open();
const res = await page.evaluate(async () => {
  const out = [];
  for (const inst of ["piano", "guitar"]) for (const st of ACC_STYLES) for (let p = 0; p < st.progs.length; p++) {
    state.inst = inst; state.style = st.id; state.prog = p; state.pattern = ""; state.tempo = 0; state.tonic = st.minor ? "A" : "C";
    renderControls();
    const before = window.__scoreReady;
    regenerate({ now: true });
    const t0 = Date.now(); while (window.__scoreReady === before && Date.now() - t0 < 20000) await new Promise(r => setTimeout(r, 30));
    const g = curGen;
    const steps = cursorSteps.length, svgNotes = document.querySelectorAll("#osmd .vf-stavenote").length;
    const lyr = [...document.querySelectorAll("#osmd text")].map(t => t.textContent).filter(x => /^(T|1|2|3|原位|一轉|二轉|三轉|A型|B型|掃弦)$/.test(x));
    out.push({ inst, style: st.id, prog: p, names: g.passNames.join(" ") + " | " + g.endName, capo: g.guide.capo, bars: g.bars.length, steps, svgNotes,
      lyrics: lyr.length, inv: inst === "piano" ? g.guide.steps.map(s => s.rhLabel).join(",") : g.guide.shapes.map(s => s.shapeName + "=" + s.frets.map(f => f < 0 ? "x" : f).join("") + ":" + s.fingers.join("")).join(" ") });
  }
  return out;
});
for (const r of res) console.log(JSON.stringify(r));
console.log("errors:", errors);
await browser.close();
