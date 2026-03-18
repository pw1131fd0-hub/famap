# 開發日誌

---

## [2026-03-19 02:14:51] [dev] 15%

M1 (環境搭建與基礎地圖渲染) 完成。前端已整合 Leaflet 渲染基礎地圖，後端已建構 Express 基礎架構並提供健康檢查 API。項目已推送到 GitHub 倉庫。

---

## [2026-03-19 03:30:00] [dev] 60%

M3 (使用者評論與評分) 完成。實作了評論 API (GET/POST)、後端 ReviewService 與 Controller，並在前端增加了評論清單、撰寫評論表單以及地點詳情側邊欄。所有程式碼通過 TypeScript 型別檢查且可成功建置。

---

## [2026-03-18 22:30:00] [dev] 80%

M4 (新增/編輯地點與無障礙篩選) 完成。
- 實作後端 Location 建立 (POST) 與 更新 (PATCH) API。
- 更新 LocationService 支援嬰兒車無障礙篩選。
- 前端新增 "Stroller Friendly" 切換開關。
- 前端新增 "Add Location" 表單與整合 API。
- 修正多個 TypeScript 型別檢查錯誤。
- 所有專案成功通過建置檢查。

> I have completed M4.
- Updated the backend with POST and PATCH endpoints for locations.
- Integrated the stroller accessibility filter into the nearby locations search.
- Added a new LocationForm component and integrated it with the sidebar.
- Fixed TS errors related to optional properties and nested objects.
---