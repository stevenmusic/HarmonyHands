# HarmonyHands 專案規則

## Git
- 改完、驗證過就直接 push 到 `main`,不用問(使用者明確要求)。GitHub Pages 從 main 根目錄發佈

## 定位
- 和弦伴奏指法:選風格 → 常用和弦進行 → 產生鋼琴獨奏伴奏 / 吉他分解和弦伴奏的樂譜,可播放、循環練習,說明怎麼彈
- 跟 HarmonyMap 同一系列:Map 看和弦是什麼,Hands 學和弦怎麼彈
- 產生器的起點是 ScrollScore commit d597ba8(已被 e849169 撤回)的「和弦伴奏練習產生器」

## 絕不能做的事
- **不要拆檔**:單一 index.html(跟 ScrollScore / HarmonyMap 同一套部署,之後要包成 App 上架)。測試工具放 tools/,不屬於 App
- **不要把取樣複製進來**:音色直接從 `https://raw.githubusercontent.com/stevenmusic/ScrollScore/main/` 讀(公開 repo,可跨網域)
  - 鋼琴 `piano/`:manifest.json + `pf-<音名>-v<層>.flac`,音名用 Cs/Ds/Fs/Gs/As;30 個取樣音每 3 個半音一個(A0、C1、D♯1…);16 層力度(velRanges);
    音量 = 0.015 + 0.985×(力度/127)²;manifest 的 tune 是音分校正;只載入用得到的(音 × 力度層),截短到需要的長度
  - 民謠吉他 `guitar/steel/`:每個半音都有錄音,取最近的 root;兩層力度(1-85 / 86-127);音量 = 0.02 + 0.98×(力度/127)²
  - 下載過的存 Cache Storage(SAMPLE_CACHE,取樣改了要加版本號)
- **不要用 Tone.js 單層鋼琴或純合成音色**(預備拍的節拍器聲例外)。古典吉他先不做
- **混音照 ScrollScore**:PIANO_EQ、GTR_EQ.guitar、buildPianoHallIR 殘響(PIANO_VERB / GTR_VERB)、pianoHalfPedalTau、pianoDamperTau、
  MASTER(響度壓縮 + makeup)、真峰值限幅器 SSMasterLimiter(AudioWorklet,原始碼照抄)。響度目標 −14 ~ −11 LUFS、真峰值 ≤ −1 dBTP;
  實測鋼琴 −12.6 ~ −13.7、吉他 −12.1 ~ −13.2、真峰值約 −1.5(伴奏比一般樂曲稀疏,PIANO_GAIN 從 1.5 提到 1.9)
- **吉他 MusicXML 寫實際音高 + 高音譜號下方 8(`<clef-octave-change>-1`)**,不要加 `<transpose>`:OSMD 會自己把 8vb 譜號的音畫高八度;
  加了 transpose 播放會高八度。播放用的音符表(curGen.bars)跟 XML 同一份資料產生,D 和弦的 T 是 D3 = MIDI 50
- **吉他左手手指一律先查 FINGER_BOOK**(與 HarmonyMap index.html 完全相同,chords-db,MIT © 2016 David Rubert):
  帶空弦的低把位用 `"o"` + 實際格數查、沒空弦的用 `"r"` + 相對形狀查;查不到才用 ACC_GTR_OPEN / ACC_GTR_BARRE 自己的手指
- **F 大三和弦第一優先用小 F(× × 3 2 1 1)**,橫按 F 排第二。開放和弦只收 HarmonyMap OPEN_CANON 那一批(初學教材)
- **音名不要查表**:字母照級數推、升降照音高差算(Cdim7 才不會拼錯)
- 外觀照抄 HarmonyMap:`:root` 設計代幣、`body.light`、header 與品牌名 CSS(逐項相同)、.btn、主題/語言切換;
  圖示用同一套線稿 SVG(24 格、stroke 2、圓端點),不要用 ⚙ ☀ 這種字元。斷點只用 900 / 600 / 380 / 340 / max-height 420
- 樂譜放在米色紙張(--paper #FFFDF6)上,深色/淺色主題都一樣。OSMD 固定 2.0.0(jsdelivr)

## 產生器規則
- 進行用羅馬數字字串,`/3 /5 /b7` 表示低音是和弦的第幾音;最後補一小節主和弦(吉他用掃弦)
- 鋼琴右手 accVoiceRH:所有密集轉位裡挑離上一個和弦最近的(共同音不動);先空跑一遍讓位置穩定,反覆時每遍轉位相同(說明卡片才對得上);
  譜上右手下方 lyric 標原位/一轉/二轉/三轉;爵士右手只用無根音 A 型(3-5-7-9)/ B 型(7-9-3-5)
- 吉他:譜上每個音下方 lyric 標 T/1/2/3,上方 `<harmony>` 標和弦;accGtrPlan 找開放和弦最多、夾的格數最少的移調夾;
  轉位和弦把低音放到第 6/5/4 弦(C/E = 032010、G/B = x20003、C/G = 332010、Am/G = 302210)

## 播放
- 每個和弦一小節;往前排程 0.6 秒(schedTick),排程時間不早於 audioCtx.currentTime
- 鋼琴:左手分解音在小節內延音(像踩踏板),換和弦時放開;爵士/Boogie 不踩踏板(半踏板 pianoHalfPedalTau)
- 吉他:同一條弦再撥時才止住前一個音,換和弦時放開(下一小節同和弦就繼續響)
- 游標:畫完後走一遍 OSMD cursor 記下每一步的時間點(cursorSteps,全音符為單位 = 小節),播放時對時間找位置,並自動捲到看得到的地方
- 循環預設開、預備拍 4 下、播放中改速度從下一小節生效(樂譜等停止後重畫)

## 驗證(push 前)
- `tools/test/`(README 有指令):雲端環境 jsdelivr 被擋,用 npm 的 OSMD + playwright page.route 攔截;取樣用 curl 下載快取
- check.mjs:每種風格 × 鋼琴/吉他都產生一次,沒有錯誤、和弦名稱與轉位正確
- render.mjs + analyze.py:OfflineAudioContext(renderOffline)渲染量響度
- shot.mjs:桌機 1400×900 與手機 390×844 截圖,手機沒有橫向捲動
