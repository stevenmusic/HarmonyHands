# HarmonyHands — 和弦伴奏指法

選風格 → 選常用和弦進行 → 產生「鋼琴獨奏伴奏」或「吉他分解和弦伴奏」的樂譜,可以播放、循環練習,並告訴你怎麼彈。

跟 [HarmonyMap(和弦與音階地圖)](https://stevenmusic.github.io/HarmonyMap/) 是同一個系列:**Map 看和弦是什麼,Hands 學和弦怎麼彈。**

線上版:<https://stevenmusic.github.io/HarmonyHands/>

## 功能

- **風格與進行**:流行(1-5-6-4、6-4-1-5、1-6-4-5)、卡農(原版、低音級進轉位版)、王道進行(4-5-3-6)、抒情(低音下行 1-7-6-5-4-3-2-5)、民謠、搖滾(1-♭7-4-1)、小調(Am-F-C-G、安達魯西亞終止、i-iv-V7-i)、爵士(ii-V-I、1-6-2-5)、R&B、12 小節藍調;12 個調
- **鋼琴**:左手型態(柱式、1-5-8-5 分解、流行切分 3+3+2、阿爾貝蒂、爵士殼音 + Charleston、藍調 Boogie);右手換和弦時共同音不動、其他音走最近,所以會用轉位接起來(譜上右手下方標「原位/一轉/二轉/三轉」,爵士標 A 型/B 型無根音聲位)
- **吉他**:右手 T123 指法(台灣民謠吉他慣例:T = 拇指彈低音弦、1 = 食指第 3 弦、2 = 中指第 2 弦、3 = 無名指第 1 弦;等於古典吉他的 p/i/m/a),寫在每個音下方;左手和弦圖(手指號碼、× 不彈、○ 空弦、封閉和弦橫槓、T 彈第幾弦)。指型優先開放和弦,不夠時建議移調夾;轉位和弦把低音放在第 6/5/4 弦(C/E、G/B、C/G、Am/G)
- **練習卡片(主畫面)**:每個和弦一張卡片,鋼琴畫小鍵盤(整組進行同一段鍵盤,上方括號右手、下方括號左手)、吉他畫和弦圖(下方標每條弦由右手哪根手指撥);顏色跟 HarmonyMap 一樣:金色根音、青色其他和弦音。點卡片可以聽這個和弦
- **節奏格**:卡片下方一小節 8 或 16 格,鋼琴兩排(右手 ● / 左手音名)、吉他一排(T 1 2 3 + 第幾弦)
- **播放與練習**:播放/停止、循環(預設開)、預備拍、速度、反覆次數;播放時目前的卡片外框發光、正在彈的鍵/弦亮起來、節奏格的現在那一格亮起來
- **樂譜(選用)**:預設收起,打開才載入 OSMD;鋼琴大譜表(右手下方標轉位),吉他五線譜(T123)+ 六線譜;播放時游標跟著走
- 中文/英文介面、深色/淺色主題,設定自動記住;手機(390px 寬)可用

## 怎麼開

單一檔案 `index.html`,沒有建置步驟。直接用瀏覽器打開,或放在任何靜態網站(GitHub Pages:main 分支根目錄)。
需要網路:樂譜元件 OSMD 在打開樂譜時才從 jsdelivr 載入,鋼琴/吉他取樣從 [ScrollScore](https://github.com/stevenmusic/ScrollScore) 讀取(第一次下載後存在瀏覽器的 Cache Storage)。

## 音源與授權

| 項目 | 來源 | 授權 |
|---|---|---|
| 鋼琴 | Salamander Grand Piano V3(Alexander Holm),經 ScrollScore 整理 | CC-BY 3.0 |
| 民謠吉他 | FSS Steel-String Acoustic Guitar(FreePats),經 ScrollScore 整理 | GPL-3.0 + FreePats sound exception |
| 吉他左手指法 | [chords-db](https://github.com/tombatossals/chords-db)(© 2016 David Rubert),與 HarmonyMap 同一份 FINGER_BOOK | MIT |
| 樂譜顯示 | [OpenSheetMusicDisplay](https://opensheetmusicdisplay.org/) 2.0.0 | BSD-3 |

## 測試(開發用)

`tools/test/`:playwright 開頁面,攔截 jsdelivr 換成 npm 的 OSMD、取樣用 curl 下載後快取。

```
cd tools/test && npm i && pip install numpy scipy soundfile pyloudnorm
node check.mjs                                  # 每種風格 × 進行 × 鋼琴/吉他:卡片、亮鍵、節奏格、樂譜(含六線譜)
node render.mjs piano pop 0 C 25 p.wav && python3 analyze.py p.wav   # OfflineAudioContext 渲染、量 LUFS / 真峰值
OUT=./ node shot.mjs                            # 桌機 1400×900、手機 390×844 直式/844×390 橫式截圖(播放中)
```
