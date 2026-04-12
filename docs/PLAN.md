# 執行計劃 — FamMap 重新佈署上線

## 現有基礎

### 技術棧
| 層面 | 技術 |
|------|------|
| 前端 | React 19 + TypeScript + Vite + Leaflet.js (client/) |
| 後端 | FastAPI + Python (server/) + Express + TypeScript (server_node/) |
| 資料庫 | PostgreSQL + PostGIS |
| PWA | 是（行動優先） |
| 測試 | Vitest (前端) + Pytest (後端) |

### 現有功能（從程式碼逆推）
- **地圖探索**：互動式地圖 + Marker 顯示 + 城市切換（台北/新北/台中/高雄）
- **地點清單**：支援分類（公園/餐廳/親子館/醫療）、設施篩選、搜尋建議
- **地點詳情**：相片牆、評價、擁擠度回報、活动列表、路線規劃
- **進階功能**：語音搜尋、家庭 Trip Planner、景點比價、預約推薦、設施補助推薦
- **Operator Dashboard**：Venue Manager Portal、質量評估、_child Development Recommender
- **i18n**：繁體中文 + 英文
- **PWA**：Offline 支援（IndexedDB）、深色模式、Sentry 錯誤追蹤
- **驗證機制**：JWT-based auth（server_node）、Session（server/FastAPI）

### docs/ 目錄現況
```
docs/
├── PRD.md          ✅ 存在（完整，8項結構）
├── SA.md           ✅ 存在（架構概觀）
├── SD.md           ✅ 存在（API定義、DB Schema）
├── SECURITY.md     ✅
├── PERFORMANCE.md  ✅
├── DEPLOYMENT.md   ✅
└── ...（眾多 ITERATION 文件）
```

---

## PRD 評估

| 項目 | 狀態 | 備註 |
|------|------|------|
| 產品願景 | ✅ | 完整陳述 FamMap 定位與核心痛點 |
| User Story | ✅ | 3個角色（Local Explorer/Traveling Family/Emergency Seeker） |
| P0/P1/P2 | ✅ | P0 MVP 6項、P1 4項、P2 3項，詳細說明 |
| 非功能需求 | ✅ | 效能/安全/可用性/擴充性/響應式 |
| 技術選型 | ✅ | 完整 Stack 列表 |
| UI/UX 色彩 | ✅ | Color Palette（#A7C7E7 等）+ Typography + RWD Breakpoints |
| 成功指標 | ✅ | User Retention、Data Growth、Search Success Rate |

**狀態**：存在且完整，所有 7 項均 >= 50 字

---

## SA/SD 評估

| 文件 | 狀態 |
|------|------|
| SA.md | ✅ 存在，包含系統架構圖、Component職責、Data Flow、部署架構、第三方依賴 |
| SD.md | ✅ 存在，包含完整 RESTful API 定義（Locations/Reviews/Favorites/Auth/i18n）、DB Schema（6張表）、Error Handling、Sequence Diagram |

**狀態**：存在且完整

---

## 建議執行階段

### Phase 1: 直接進 dev（Quality Gate）
PRD >= 85 ✅ 且 SA/SD >= 85 ✅，依據 Quality Gate 路徑可直接進入 **dev** 階段。

### Phase 2: dev → test → security
依序通過 90/95/95 分品質關卡後進入完成階段。

---

## 優先修復清單（dev 切入時）

### 功能穩定性（1-2 個）
1. **年齡篩選機制不一致** — App.tsx:77-80 註解掉了 `childAge` filter（註解：`Age filtering disabled for mobile stability`），但 SD 中的設施查詢仍依賴此參數，應評估重新啟用或移除 dead code。
2. **離線地圖功能尚未啟用** — PWA offline maps 列為 P2，但 `server_node/src/data/seed-data.ts` 只有記憶體資料庫，無真正離線下載邏輯。

### 安全性（1 個）
3. **JWT Secret 採用 Hardcoded 值** — `server_node/src/middleware/auth.ts:14` 使用固定 secret `super-secret-key-for-jwt`，建議改用環境變數。

### 效能（1 個）
4. **首次 Bundle 過大** — App.tsx 使用大量 `lazy()` 載入（約 15+ 個元件），但首屏仍需載入所有翻譯與初始狀態；建議核查 `index.css` (43KB) 是否可做 tree-shaking。

### 文件一致性（1 個）
5. **Server 雙實作需統一** — 目前同時存在 `server/`（FastAPI + Python）與 `server_node/`（Express + TypeScript），功能重疊但部署腳本混用；建議確認 Production 使用哪一個。

---

## Quality Gate 路徑

```
PRD (85) → SA+SD (85) → dev (90) → test (95) → security (95) → done
   ✅              ✅        🔜
```

---

## 確認事項

請老闆確認：
1. **現有基礎評估是否正確？** — 特別是雙 Server 實作（FastAPI vs Express）應以哪個為 Production？
2. **優先修復清單是否有遺漏？** — JWT secret 與 age filter 是高優先級問題嗎？
3. **執行階段順序是否同意？** — 若同意直接進 dev，Worker 即開始品質改進工作。

確認後回覆「可以，開始」，Worker 就會正式執行。
