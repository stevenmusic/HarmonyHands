# HarmonyHands — 和弦伴奏指法

選風格 → 選常用和弦進行 → 產生「鋼琴獨奏伴奏」或「吉他分解和弦伴奏」的樂譜,可以播放、循環練習,並告訴你怎麼彈。

跟 [HarmonyMap(和弦與音階地圖)](https://stevenmusic.github.io/HarmonyMap/) 是同一個系列:**Map 看和弦是什麼,Hands 學和弦怎麼彈。**

線上版:<https://stevenmusic.github.io/HarmonyHands/>

## 功能

- **風格與進行**:流行(1-5-6-4、6-4-1-5、1-6-4-5、王道進行 4-5-3-6、4-5-3-6-2-5-1)、抒情(卡農、卡農轉位低音下行、低音下行 1-7-6-5-4-3-2-5、小調 i-iv-V7-i)、民謠(1-4-1-5、1-4-5-1、1-6-2-5)、搖滾(1-4-5-4、1-♭7-4-1、小調 i-♭VII-♭VI-♭VII)、藍調(12 小節)、爵士(2-5-1、1-6-2-5、3-6-2-5-1)、R&B / 靈魂、拉丁(巴薩諾瓦 2-5-1、佛朗明哥安達魯西亞終止);12 個調,小調進行自動換小調
- **鋼琴**:左手、右手型態分開選,每個風格只列適用的(左手:八度長音、八度切分、1-5-8-5、1-5-10、阿爾貝蒂、Boom-chick、八度八分、行走低音、殼音、Boogie、巴薩諾瓦;右手:全音符、二分、四分、八分、切分 3+3+2、第 2・4 拍、Charleston、切分短奏、右手分解);右手換和弦時共同音不動、其他音走最近(轉位);左手一定在右手下面;爵士/R&B 用無根音聲位;藍調、爵士播放時搖擺
- **吉他**:右手 T123 指法(台灣民謠吉他慣例:T = 拇指彈低音弦、1 = 食指第 3 弦、2 = 中指第 2 弦、3 = 無名指第 1 弦;等於古典吉他的 p/i/m/a),每個風格只列適用的指法(分解、交替低音、Travis、低音-和弦、四拍和弦、巴薩諾瓦…);左手和弦圖。指型優先開放和弦,不夠時建議移調夾
- **練習卡片(主畫面)**:每個和弦一張卡片,鋼琴畫小鍵盤(整組進行同一段鍵盤,上方括號右手、下方括號左手)、吉他畫和弦圖(下方標每條弦由右手哪根手指撥);顏色跟 HarmonyMap 一樣:金色根音、青色其他和弦音。點卡片可以聽這個和弦
- **節奏格**:卡片下方一小節 8 或 16 格,鋼琴兩排(右手 ● / 左手音名)、吉他一排(T 1 2 3 + 第幾弦)
- **播放與練習**:播放/停止、循環(預設開)、預備拍、速度、反覆次數;播放中換調、型態、速度不會停;播放時目前的卡片外框發光、正在彈的鍵/弦亮起來、節奏格的現在那一格亮起來
- **樂譜**:預設打開(可收起),打開時才載入 OSMD;譜上不寫指法文字;照標準記譜(連桿依拍子分組、鋼琴踏板記號、吉他手指/拇指分兩個聲部、掃弦琶音記號);鋼琴大譜表,吉他五線譜(手指、拇指兩個聲部)+ 六線譜;播放時游標跟著走
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
node xmlcheck.mjs                               # 全部風格×進行×型態×12 調:時值、連桿、兩手不撞、行走低音
node livechange.mjs                             # 播放中換調/型態/速度不停
OUT=./ node scoreshot.mjs                       # 各伴奏型態的樂譜截圖
OUT=./ node shot.mjs                            # 桌機 1400×900、手機 390×844 直式/844×390 橫式截圖(播放中)
```
