# Context Engine Implementation Plan

## Overview

**Status**: IN PROGRESS  
**Start Date**: 2026-01-03  
**Target**: Augment Code-class Context Engine

---

## Goal

實作一個獨立的 Context Engine，達到 Augment Code 等級的 context 理解能力：

1. **Real-time Codebase Indexing** - 即時索引
2. **Intent-aware Retrieval** - 意圖感知檢索
3. **Multi-method Retrieval Fusion** - 多方法融合檢索
4. **Token Budget Optimization** - Token 預算優化

---

## Architecture

```text
Context Engine
├── Indexer/                    # 索引層
│   ├── FileWatcher.ts          # 檔案變更監聽
│   ├── IncrementalIndexer.ts   # 增量索引器
│   ├── ChunkProcessor.ts       # 程式碼切塊處理
│   └── MetadataStore.ts        # SQLite 元資料儲存
│
├── Embeddings/                 # 嵌入層
│   ├── EmbeddingProvider.ts    # 嵌入向量提供者介面
│   ├── LocalEmbeddings.ts      # 本地 transformers.js
│   └── VectorStore.ts          # LanceDB 向量儲存
│
├── Retriever/                  # 檢索層
│   ├── SemanticRetriever.ts    # 語意向量檢索
│   ├── LexicalRetriever.ts     # 全文詞彙檢索
│   ├── DependencyWalker.ts     # 依賴圖走訪
│   ├── RecentEditsRetriever.ts # 最近編輯檢索
│   └── CandidateFusion.ts      # 候選結果融合
│
├── Intent/                     # 意圖層
│   ├── IntentClassifier.ts     # 意圖分類器
│   ├── IntentTypes.ts          # 意圖類型定義
│   └── StrategySelector.ts     # 策略選擇器
│
├── Ranking/                    # 排序層
│   ├── Ranker.ts               # 候選排序器
│   └── ScoringFormula.ts       # 評分公式
│
├── Budget/                     # 預算層
│   ├── TokenCounter.ts         # Token 計數器
│   ├── BudgetAllocator.ts      # 預算分配器
│   └── PromptPacker.ts         # Prompt 打包器
│
└── ContextEngine.ts            # 主入口
```

---

## Phase 1: Real-time Codebase Indexing

### 1.1 建立 Context Engine 模組結構

**目標**: 建立清晰的目錄結構和核心介面

**任務**:

- 建立 `core/context-engine/` 目錄
- 定義 `IContextEngine` 主介面
- 定義 `IIndexer`, `IRetriever`, `IRanker` 介面
- 建立類型定義檔案

### 1.2 實作 File Watcher

**目標**: 監聽檔案系統變更，觸發增量索引

**任務**:

- 使用 VSCode FileSystemWatcher API
- 實作變更事件佇列（debounce）
- 支援 `.continueignore` 規則
- 處理大型專案的效能考量

### 1.3 實作 Incremental Indexer

**目標**: 只處理變更的檔案，避免重複計算

**任務**:

- 實作檔案 hash 快取
- 增量更新邏輯
- 背景索引（不阻塞 UI）
- 索引狀態追蹤

### 1.4 整合 LanceDB 向量儲存

**目標**: 儲存和查詢 embeddings

**任務**:

- 整合現有 LanceDB 程式碼
- 實作表格管理（per-branch）
- 向量查詢 API
- 索引清理和維護

### 1.5 實作本地 Embedding Provider

**目標**: 使用 transformers.js 計算 embeddings

**任務**:

- 包裝現有 TransformersJsEmbeddingsProvider
- 批次處理支援
- 快取機制
- 錯誤處理

### 1.6 建立 SQLite metadata 儲存

**目標**: 儲存檔案元資料和索引狀態

**任務**:

- 設計資料表結構
- 實作 CRUD 操作
- 快取層
- 資料遷移支援

---

## Deliverables

### Phase 1 完成標準

- [ ] 新檔案在儲存時自動索引
- [ ] 索引過程不阻塞 UI
- [ ] 向量搜尋可正常運作
- [ ] 索引狀態可查詢
- [ ] 單元測試覆蓋率 > 80%

---

## Phase 2: Intent-aware Retrieval

### 2.1 定義 Intent 類型

**意圖類型**:
| Intent | 描述 | 檢索策略傾向 |
|-----------|-------------------|-------------------|
| explain | 解釋程式碼或行為 | 語意 + 依賴圖 |
| bug_fix | 診斷和修復錯誤 | 最近編輯 + 錯誤相關 |
| refactor | 改善結構或可讀性 | 依賴圖 + 語意 |
| generate | 生成新程式碼 | 語意 + 範例 |
| test | 撰寫或修復測試 | 測試檔案 + 被測對象 |

### 2.2 實作 Rule-based Intent Classifier

**規則範例**:

- 包含 "error", "bug", "fix" → `bug_fix`
- 包含 "explain", "what", "how" → `explain`
- 包含 "refactor", "improve", "clean" → `refactor`

### 2.3 設計 Retrieval Strategy Selector

根據意圖選擇不同的檢索權重組合。

### 2.4 整合意圖分類到檢索流程

在 `ContextEngine.query()` 入口點加入意圖分類。

---

## Phase 3: Multi-method Retrieval Fusion

### 3.1-3.4 實作四種檢索器

| 檢索器               | 用途             | 技術              |
| -------------------- | ---------------- | ----------------- |
| SemanticRetriever    | 語意相似度       | LanceDB 向量搜尋  |
| LexicalRetriever     | 精確關鍵字匹配   | SQLite FTS5       |
| DependencyWalker     | import/call 關係 | AST 分析 + 圖走訪 |
| RecentEditsRetriever | 最近編輯的檔案   | Git + 時間戳      |

### 3.5 建立 Candidate Fusion 邏輯

**融合策略**: Reciprocal Rank Fusion (RRF)

```
score = Σ (1 / (k + rank_i))
```

### 3.6 實作 Ranker

**評分公式**:

```
final_score = semantic_similarity
            + dependency_weight
            + recency_boost
            - scope_penalty
```

---

## Phase 4: Token Budget Optimization

### 4.1 實作 Token Counter

使用 tiktoken 或類似工具計算 token 數量。

### 4.2 設計 Budget Allocator

| 區塊    | 分配比例 |
| ------- | -------- |
| SYSTEM  | 固定     |
| CONTEXT | 40-60%   |
| TASK    | 5-10%    |
| INPUT   | 可變     |
| OUTPUT  | 剩餘     |

### 4.3 實作 Prompt Packer

按照分數排序，在預算內打包 context。

### 4.4 建立 Truncation 策略

- 優先保留高分項目
- 按區塊截斷，不破壞結構
- 記錄被截斷的內容

### 4.5 整合到 Prompt Assembly 流程

與現有的 Prompt 組裝邏輯整合。

---

## References

- `docs/context-engine.md` - Context Engine 規格
- `docs/architecture.md` - 系統架構
- `core/indexing/` - 現有索引實作（參考用）
