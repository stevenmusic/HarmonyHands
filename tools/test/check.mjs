// 每種風格 × 進行 × 鋼琴/吉他:產生、練習卡片、節奏格、樂譜(含吉他六線譜)都畫得出來
import { open } from "./harness.mjs";
const { browser, page, errors } = await open();
const res = await page.evaluate(async () => {
  const out = [];
  state.showScore = true; applyScoreToggle();
  for (const inst of ["piano", "guitar"]) for (const st of ACC_STYLES) for (let p = 0; p < st.progs.length; p++) {
    Object.assign(state, { inst, style: st.id, prog: p, lh: "", rh: "", gpat: "", tempo: 0, tonic: st.progs[p].minor ? "A" : "C" });
    renderControls();
    const before = window.__scoreReady || 0;
    regenerate({ now: true });
    const t0 = Date.now(); while ((window.__scoreReady || 0) === before && Date.now() - t0 < 20000) await new Promise(r => setTimeout(r, 30));
    const g = curGen, cards = [...document.querySelectorAll("#stageRow .scard")];
    const problems = [];
    if (cards.length !== g.passLen + 1) problems.push("cards " + cards.length);
    g.guide.steps.forEach((s, i) => {
      if (inst === "piano") {
        const lit = cards[i].querySelectorAll("svg.kb .r, svg.kb .t").length, want = new Set([...s.rhMidi, ...s.lhMidi]).size;
        if (lit !== want) problems.push(`card${i} lit ${lit}/${want}`);
        if (!cards[i].querySelector("svg.kb .r") && ![...s.rhMidi, ...s.lhMidi].every(m => m % 12 !== s.rootPc)) problems.push(`card${i} no root`);
      } else {
        const toks = [...cards[i].querySelectorAll("svg.gb .tok")].length;
        if (!s.end && !toks) problems.push(`card${i} no tokens`);
      }
    });
    const gridCells = document.querySelectorAll("#grid .c.on").length;
    if (!gridCells) problems.push("grid empty");
    const tabNotes = document.querySelectorAll("#osmd .vf-tabnote").length, staveNotes = document.querySelectorAll("#osmd .vf-stavenote").length;
    out.push({ inst, style: st.id, prog: p, names: g.passNames.join(" "), capo: g.guide.capo, steps: cursorSteps.length, staveNotes, tabNotes, gridCells, problems });
  }
  return out;
});
let bad = 0;
for (const r of res) { if (r.problems.length || !r.steps || (r.inst === "guitar" && !r.tabNotes)) bad++; console.log(JSON.stringify(r)); }
console.log("bad:", bad, "errors:", errors.filter(e => !/ERR_FAILED/.test(e)));
await browser.close();
