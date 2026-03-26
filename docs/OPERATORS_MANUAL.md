# FamMap 操作手冊 (Operators Manual)

## 目錄
1. [系統要求](#系統要求)
2. [安裝與部署](#安裝與部署)
3. [運維操作](#運維操作)
4. [監控與健康檢查](#監控與健康檢查)
5. [故障排除](#故障排除)
6. [備份與恢復](#備份與恢復)
7. [性能調優](#性能調優)

## 系統要求

### 硬體要求
- CPU: 2 cores (最小), 4 cores (建議)
- RAM: 4GB (最小), 8GB (建議)
- 存儲: 20GB (初始), 根據數據增長預留額外空間
- 網絡: 穩定的互聯網連接

### 軟體要求
- **操作系統**: Linux (Ubuntu 20.04+, CentOS 7+) 或 macOS 12+
- **Python**: 3.9+
- **Node.js**: 18+
- **npm**: 9+
- **Package Manager**: pip, npm

### 網絡要求
- **Backend Port**: 3001 (可配置)
- **Frontend Port**: 3004 (開發), 443 (生產)
- **Firewall**: 開放必要的入站/出站端口

## 安裝與部署

### 快速開始

#### 1. 克隆項目
```bash
git clone <repository-url>
cd famap
```

#### 2. 使用健壯部署腳本
```bash
chmod +x deploy-robust.sh
./deploy-robust.sh
```

或指定自定義端口:
```bash
BACKEND_PORT=8001 FRONTEND_PORT=3005 ./deploy-robust.sh
```

#### 3. 驗證部署
```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/ready
```

### 手動部署步驟

#### 後端部署
```bash
cd server
python3 -m pip install -r requirements.txt --break-system-packages
cd ..
PORT=3001 python3 start_server.py
```

#### 前端部署
```bash
cd client
npm install --legacy-peer-deps
npm run dev -- --port 3004 --host 0.0.0.0
```

## 運維操作

### 查看日誌
```bash
# 後端日誌
tail -f logs/backend.log

# 前端日誌
tail -f logs/frontend.log

# 部署日誌
tail -f logs/deployment.log
```

### 停止服務
```bash
# 停止所有服務
./deploy-robust.sh  # 按 Ctrl+C

# 或手動停止
kill $(cat backend.pid)
kill $(cat frontend.pid)
```

### 重啟服務
```bash
# 完整重啟
./deploy-robust.sh

# 或快速重啟
pkill -f "python3 start_server.py" || true
pkill -f "npm run dev" || true
sleep 2
./deploy-robust.sh
```

### 配置環境變數
編輯 `.env` 文件:
```
ENVIRONMENT=production
PORT=3001
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

## 監控與健康檢查

### 健康檢查端點

#### 存活探針 (Liveness)
```bash
curl http://localhost:3001/health
# 響應: {"status":"alive","timestamp":"2026-03-26T..."}
```

#### 準備探針 (Readiness)
```bash
curl http://localhost:3001/health/ready
# 響應: {"status":"ready","locations_available":150,"timestamp":"2026-03-26T..."}
```

#### 詳細存活檢查
```bash
curl http://localhost:3001/health/live
# 響應包含版本、環境、運行時間等信息
```

### 性能監控

#### API 響應時間
在日誌中查找 `request_duration_ms`:
```bash
grep "request_duration_ms" logs/backend.log | tail -20
```

#### 系統資源使用
```bash
# 查看 Python 進程
ps aux | grep "python3 start_server.py"

# 查看 Node 進程
ps aux | grep "npm run dev"

# 監控資源使用
top -p $(cat backend.pid)
```

## 故障排除

### 常見問題

#### 問題 1: 端口已在使用
```
Error: Address already in use (port 3001)
```

**解決方案:**
```bash
# 查找佔用端口的進程
lsof -Pi :3001 -sTCP:LISTEN -t

# 或使用健壯部署腳本 (自動處理)
./deploy-robust.sh
```

#### 問題 2: Python 依賴安裝失敗
```
Error: ModuleNotFoundError
```

**解決方案:**
```bash
cd server
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt --break-system-packages
```

#### 問題 3: Node 依賴衝突
```
npm ERR! peer dep missing
```

**解決方案:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 問題 4: 前端無法連接到後端
```
CORS 錯誤或無法到達 API
```

**解決方案:**
1. 驗證後端正在運行: `curl http://localhost:3001/health`
2. 檢查 ALLOWED_ORIGINS 環境變數
3. 查看瀏覽器控制台中的 CORS 錯誤
4. 檢查防火牆設置

#### 問題 5: 應用程序耗盡內存
```
Out of memory error
```

**解決方案:**
```bash
# 增加 Node.js 的內存限制
NODE_OPTIONS="--max-old-space-size=2048" npm run dev

# 重啟服務以清除緩存
./deploy-robust.sh
```

### 調試模式

啟用詳細日誌:
```bash
# 後端
DEBUG=* python3 start_server.py

# 前端
DEBUG=* npm run dev -- --port 3004
```

## 備份與恢復

### 備份程序

#### 每日備份腳本
```bash
#!/bin/bash
BACKUP_DIR="/backups/famap-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 備份位置數據
cp -r data/ "$BACKUP_DIR/"

# 備份配置
cp .env "$BACKUP_DIR/"

# 壓縮備份
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"
```

#### Cron 計劃備份
```bash
# 每天凌晨 2 點備份
0 2 * * * /path/to/backup-script.sh
```

### 恢復程序

```bash
# 解壓備份
tar -xzf backup-2026-03-26_020000.tar.gz

# 恢復數據
cp -r backup-dir/data/* /home/crawd_user/project/famap/data/

# 恢復配置
cp backup-dir/.env /home/crawd_user/project/famap/

# 重啟應用
./deploy-robust.sh
```

## 性能調優

### 後端調優

#### 增加工作進程
```bash
# 使用 Gunicorn 而不是 uvicorn reload
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server.main:app
```

#### 連接池配置
編輯 `server/main.py`:
```python
# 增加連接池大小
DATABASE_POOL_SIZE = 20
```

### 前端調優

#### 構建優化
```bash
cd client
npm run build

# 分析包大小
npm run build:report
```

#### 緩存策略
編輯 `client/vite.config.ts`:
```typescript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'leaflet': ['leaflet'],
          'react': ['react', 'react-dom']
        }
      }
    }
  }
}
```

### 數據庫調優

#### 索引優化
```sql
-- 創建空間索引 (如果使用 PostGIS)
CREATE INDEX idx_locations_geom ON locations USING GIST(geom);
```

#### 查詢優化
啟用查詢日誌:
```bash
# 在 PostgreSQL 中
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

## 監控儀表板

推薦的監控工具:
- **Prometheus**: 指標收集
- **Grafana**: 可視化儀表板
- **ELK Stack**: 日誌聚合

### 集成步驟
參見 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的監控部分。

## 支持與聯絡

- **技術支持**: 查看 [FAMILY_FAQ.md](./FAMILY_FAQ.md) 的常見問題
- **問題報告**: 提交 GitHub Issue
- **文檔**: https://github.com/project/famap/docs

---

**更新於**: 2026-03-26
**版本**: 1.0
**維護者**: FamMap Team
