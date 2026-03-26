# FamMap 監控與警報系統

## 概述

本文檔描述 FamMap 的監控策略、關鍵指標、警報閾值和應急響應程序。

## 健康檢查架構

### Kubernetes 健康檢查集成

#### Liveness Probe (存活探針)
- **端點**: `GET /health`
- **目的**: 檢測應用程序是否正在運行
- **超時**: 5 秒
- **初始延遲**: 10 秒
- **失敗閾值**: 3 次失敗後重啟

配置示例:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3
```

#### Readiness Probe (準備探針)
- **端點**: `GET /health/ready`
- **目的**: 檢測應用程序是否準備好接受流量
- **超時**: 5 秒
- **初始延遲**: 5 秒
- **失敗閾值**: 2 次失敗後移除流量

配置示例:
```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 2
```

#### Startup Probe (啟動探針)
- **端點**: `GET /health/live`
- **目的**: 檢測應用程序是否完成啟動
- **超時**: 10 秒
- **初始延遲**: 0
- **失敗閾值**: 30 次失敗

配置示例:
```yaml
startupProbe:
  httpGet:
    path: /health/live
    port: 3001
  periodSeconds: 10
  failureThreshold: 30
```

## 關鍵性能指標 (KPI)

### 後端 API 指標

| 指標 | 警告閾值 | 嚴重閾值 | 說明 |
|------|---------|---------|------|
| API 響應時間 P50 | 500ms | 2000ms | 中位數響應時間 |
| API 響應時間 P99 | 1000ms | 5000ms | 99 百分位響應時間 |
| 錯誤率 | 5% | 10% | 5xx 和 4xx 错误的百分比 |
| 請求吞吐量 | <100 req/s | <50 req/s | 每秒請求數 |
| 可用性 | <99.5% | <99% | 成功響應的百分比 |

### 前端 KPI

| 指標 | 警告閾值 | 嚴重閾值 | 說明 |
|------|---------|---------|------|
| 首次內容繪製 (FCP) | 3s | 5s | 頁面首次繪製時間 |
| 最大內容繪製 (LCP) | 4s | 7s | 最大內容區塊加載時間 |
| 累積佈局偏移 (CLS) | 0.1 | 0.25 | 視覺穩定性分數 |
| 首先輸入延遲 (FID) | 100ms | 300ms | 交互延遲時間 |
| 已安裝應用 | >1000 | >500 | PWA 安裝數 |

### 系統資源指標

| 指標 | 警告閾值 | 嚴重閾值 | 說明 |
|------|---------|---------|------|
| CPU 使用率 | 70% | 90% | 處理器使用率 |
| 內存使用率 | 75% | 90% | RAM 使用率 |
| 磁盤使用率 | 80% | 95% | 儲存空間使用率 |
| 打開文件數 | 80% | 95% | 文件描述符使用率 |

## 監控實施

### 日誌收集

#### 日誌級別
```python
# 後端日誌配置
LOG_LEVEL = "INFO"  # 生產環境
# 可選值: DEBUG, INFO, WARNING, ERROR, CRITICAL
```

#### 日誌格式
```json
{
  "timestamp": "2026-03-26T12:34:56Z",
  "level": "INFO",
  "service": "api",
  "request_id": "abc123",
  "message": "Request processed",
  "request_duration_ms": 145,
  "status_code": 200
}
```

#### 日誌聚合
推薦工具:
- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **Splunk**: 企業級日誌管理
- **CloudWatch**: AWS 環境

### 指標收集

#### Prometheus 指標
```
# 後端應用指標
fammap_http_requests_total{method="GET",endpoint="/api/locations",status="200"}
fammap_http_request_duration_seconds{quantile="0.95",endpoint="/api/locations"}
fammap_locations_total
fammap_database_connections_active
```

#### Grafana 儀表板
建立以下儀表板:
1. **系統健康**: CPU、內存、磁盤、網絡
2. **API 性能**: 響應時間、吞吐量、錯誤率
3. **業務指標**: 活躍用戶、搜索數、收藏數
4. **數據庫**: 連接池、查詢時間、鎖定

### 分佈式追蹤

#### 集成 Jaeger
```python
from jaeger_client import Config

config = Config(
    config={
        'sampler': {'type': 'const', 'param': 1},
        'logging': True,
    },
    service_name='fammap-api',
    validate=True,
)
tracer = config.initialize_tracer()
```

## 警報規則

### 關鍵警報

#### 服務不可用
```yaml
alert: FamMapServiceDown
condition: up{job="fammap-api"} == 0
duration: 5m
severity: critical
action: 立即頁面告知 (Page)、自動回滾
```

#### 高錯誤率
```yaml
alert: HighErrorRate
condition: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
duration: 5m
severity: critical
action: 頁面告知、人工審查
```

#### API 響應緩慢
```yaml
alert: SlowAPI
condition: histogram_quantile(0.95, http_request_duration_seconds) > 2
duration: 10m
severity: warning
action: 發送通知、監控趨勢
```

#### 高 CPU 使用率
```yaml
alert: HighCPU
condition: container_cpu_usage_seconds_total > 0.7
duration: 15m
severity: warning
action: 發送通知、考慮擴展
```

#### 磁盤空間不足
```yaml
alert: LowDiskSpace
condition: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
duration: 5m
severity: critical
action: 立即頁面告知、清理舊日誌
```

## 應急響應程序

### 警報升級路徑

```
Level 1 (自動)
↓
自動重啟應用
↓
Level 2 (15 分鐘後)
↓
通知運維團隊 (Slack/Email)
↓
Level 3 (30 分鐘後)
↓
啟動事件指揮體系 (ICS)
↓
Page 值班人員
↓
可能的故障轉移
```

### 常見故障場景

#### 場景 1: API 無響應
```
1. 檢查服務狀態
2. 查看最近日誌
3. 檢查資源使用
4. 嘗試溫重啟
5. 檢查依賴項 (數據庫、外部 API)
6. 如果失敗，執行冷重啟和回滾
```

#### 場景 2: 高內存使用
```
1. 檢查內存泄漏
2. 查看進程日誌
3. 殺死舊進程
4. 檢查連接池配置
5. 如果持續，升級至人工介入
```

#### 場景 3: 數據庫連接池耗盡
```
1. 檢查活動連接
2. 查看慢查詢日誌
3. 終止長時間運行的查詢
4. 檢查應用程序連接泄漏
5. 增加連接池大小或重啟應用
```

## 監控最佳實踐

### 告警設置
- ✅ 設置合理的閾值，避免告警疲勞
- ✅ 使用多個條件組合，減少誤告警
- ✅ 定期審查和調整告警規則
- ✅ 按嚴重性分類告警

### 儀表板設計
- ✅ 每頁只顯示必要的指標
- ✅ 使用清晰的色彩編碼
- ✅ 包含歷史趨勢圖表
- ✅ 添加補救步驟快速鏈接

### 日誌最佳實踐
- ✅ 使用結構化日誌格式
- ✅ 包含 request ID 用於追蹤
- ✅ 避免記錄敏感信息
- ✅ 定期清理舊日誌

### 測試與演習
- ✅ 每月進行故障轉移演練
- ✅ 定期測試備份和恢復
- ✅ 模擬警報場景測試流程
- ✅ 記錄教訓和改進

## 監控工具集成

### 推薦技術棧

```
Application
    ↓
Prometheus (metrics collection)
    ↓
Grafana (visualization)
    ↓
AlertManager (alerting)
    ↓
Slack/PagerDuty/Email (notifications)
```

### 快速開始

#### Docker Compose 示例
```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"

  alertmanager:
    image: prom/alertmanager
    ports:
      - "9093:9093"
```

## 指標導出

### Prometheus 導出格式
```
# HELP fammap_http_request_duration_seconds HTTP request latency
# TYPE fammap_http_request_duration_seconds histogram
fammap_http_request_duration_seconds_bucket{le="0.1"} 100
fammap_http_request_duration_seconds_bucket{le="0.5"} 450
fammap_http_request_duration_seconds_bucket{le="1.0"} 480
```

### 查詢示例

```promql
# 過去 5 分鐘的平均響應時間
rate(fammap_http_request_duration_seconds_sum[5m]) / rate(fammap_http_request_duration_seconds_count[5m])

# 錯誤率
rate(fammap_http_requests_total{status=~"5.."}[5m]) / rate(fammap_http_requests_total[5m])

# 可用性
rate(fammap_http_requests_total{status!~"5.."}[5m]) / rate(fammap_http_requests_total[5m])
```

## 文檔更新

- **上次更新**: 2026-03-26
- **版本**: 1.0
- **維護者**: FamMap Ops Team

---

更多信息請參見:
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [OPERATORS_MANUAL.md](./OPERATORS_MANUAL.md)
- [FAMILY_FAQ.md](./FAMILY_FAQ.md)
