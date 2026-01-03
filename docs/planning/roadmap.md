# Continue.dev × Claude 4.5

## AI IDE Assistant – Development Roadmap

> This document defines the **authoritative development roadmap** for building
> a production-grade, Augment-Code-class IDE AI assistant based on a
> Continue.dev fork.
>
> It is intended to be used as:
>
> - a long-term architectural guide
> - a feature completion checklist
> - a quality and scope evaluation standard

---

## 0. Project Goals & Non-Goals

### 0.1 Core Goals

- Build a **VSCode-native AI assistant** with:
  - Claude 4.5 as primary LLM (Haiku / Sonnet / Opus)
  - First-class **Context Engine** (multi-file, semantic, intent-aware)
  - High trust, **human-in-the-loop agent tools**
- Match or exceed **Augment Code** in:
  - context relevance
  - suggestion precision
  - non-intrusive UX
- Architecture must be:
  - modular
  - model-agnostic
  - long-term maintainable

### 0.2 Explicit Non-Goals

- Not a Copilot clone
- Not a fully autonomous “Cline-style” agent
- Not a chat-only wrapper around LLM APIs

---

## 1. High-Level Architecture

```text
VSCode Extension
  Sidebar UI (Chat / Tasks)
  Inline Completion Provider
  Commands & Code Actions

  Core Bridge
      ↓
Core Engine (Node)
  LLM Abstraction Layer
  Context Engine
      Indexer
      Retriever
      Ranker
      Prompt Assembler
  Agent Runtime
  Tool Registry
      ↓
Local Services
  LanceDB (Vector Store)
  Embedding Provider
  Shell / FS Sandbox
```

---

## 2. LLM Strategy (Claude 4.5)

### 2.1 Supported Models

| Model             | Usage                                       |
| ----------------- | ------------------------------------------- |
| Claude Haiku 4.5  | Inline completion, low-latency tasks        |
| Claude Sonnet 4.5 | Chat, explanation, doc generation           |
| Claude Opus 4.5   | Complex reasoning, refactor, agent planning |

### 2.2 LLM Abstraction Contract

```ts
interface LLMClient {
  streamChat(messages, context): AsyncIterable<Token>;
  completeInline(context): AsyncIterable<Token>;
  runAgent(prompt, tools, context): AgentResult;
}
```

All future providers (OpenAI / Gemini) must conform to this interface.

---

## 3. Development Phases Overview

| Phase   | Focus                             | Status      |
| ------- | --------------------------------- | ----------- |
| Phase 0 | Fork stabilization & infra        | ✅ COMPLETE |
| Phase 1 | Claude chat & inline completion   | 🔲 TODO     |
| Phase 2 | Context Engine v1 (Augment-class) | 🚧 ACTIVE   |
| Phase 3 | Error explanation & docs          | 🔲 TODO     |
| Phase 4 | Agent tools (controlled)          | 🔲 TODO     |
| Phase 5 | Context Engine v2 (Advanced)      | 🔲 TODO     |
| Phase 6 | UX, performance, reliability      | 🔲 TODO     |

---

## Phase 0 – Foundation & Fork Stabilization

### Objectives

- Establish long-term maintainable fork of Continue.dev
- Decouple Core, UI, and Context logic

### Deliverables

- [ ] Forked Continue repo under own org
- [ ] Clear module boundaries:
  - `core/`
  - `context-engine/`
  - `extension/`
- [ ] LLM provider abstraction implemented
- [ ] Claude provider implemented (non-stream + stream)
- [ ] API key storage via VSCode Secret Storage

### Acceptance Criteria

- Claude chat works via Core, not directly from UI
- Switching model does not change UI logic

---

## Phase 1 – Claude Chat & Inline Completion

### 1. Claude Chat (Sidebar)

#### 1.1 Features

- Streaming responses
- Multi-turn conversation
- Model selection (Haiku / Sonnet / Opus)
- Context injection hooks (empty for now)

#### 1.2 Acceptance Criteria

- No blocking UI
- Token streaming visible
- Conversation state survives reload

---

### 2. Inline Completion

#### 2.1 Features

- Inline ghost text
- Debounced requests
- Language-agnostic

#### 2.2 Context (minimal)

- Current line
- Surrounding function
- Language metadata

#### 2.3 Acceptance Criteria

- No completion spam
- Cancels outdated requests
- Haiku used by default

---

## Phase 2 – Context Engine v1 (Augment-Class Implementation)

### Objective

實作獨立的 Context Engine，達到 Augment Code 等級的 context 理解能力。

**詳細實作計劃**: 見 `docs/phases/context-engine-implementation.md`

### 2.1 Real-time Codebase Indexing

- [ ] 建立 Context Engine 模組結構
- [ ] 實作 File Watcher（監聽檔案變更）
- [ ] 實作 Incremental Indexer（增量索引）
- [ ] 整合 LanceDB 向量儲存
- [ ] 實作本地 Embedding Provider
- [ ] 建立 SQLite metadata 儲存

### 2.2 Intent-aware Retrieval

- [ ] 定義 Intent 類型（explain, bug_fix, refactor, generate, test）
- [ ] 實作 Rule-based Intent Classifier
- [ ] 設計 Retrieval Strategy Selector
- [ ] 整合意圖分類到檢索流程

### 2.3 Multi-method Retrieval Fusion

- [ ] 實作 Semantic Retriever（向量搜尋）
- [ ] 實作 Lexical Retriever（全文搜尋）
- [ ] 實作 Dependency Walker（依賴圖走訪）
- [ ] 實作 Recent Edits Retriever
- [ ] 建立 Candidate Fusion 邏輯
- [ ] 實作 Ranker（排序與評分）

### 2.4 Token Budget Optimization

- [ ] 實作 Token Counter
- [ ] 設計 Budget Allocator
- [ ] 實作 Prompt Packer
- [ ] 建立 Truncation 策略
- [ ] 整合到 Prompt Assembly 流程

---

### Context Query API

```ts
interface ContextQuery {
  intent: IntentType;
  input: string;
  activeFile?: string;
  selection?: string;
  tokenBudget: number;
}

ContextEngine.query(query: ContextQuery): Promise<ContextResult>;
```

---

## Phase 3 – Error Explanation & Documentation

### 3.1 Error Explanation

- Diagnostics
- Active file
- Dependency graph
- Recent edits

---

### 3.2 Documentation Generation

- Function / class docs
- Module-level README
- API comments

---

## Phase 4 – Agent Tools (Controlled Execution)

### Tool Interface

```ts
interface AgentTool {
  name;
  description;
  schema;
  run(input): ToolResult;
}
```

---

## Phase 5 – Context Engine v2 (Advanced Features)

Context Engine v1 已在 Phase 2 實作。Phase 5 專注於進階功能：

- ML-based Intent Classifier（取代 rule-based）
- Semantic Caching（語意快取）
- Cross-repository Context（跨專案 context）
- Learning from User Feedback（從用戶反饋學習）

---

## Phase 6 – UX, Performance, Reliability

- Non-intrusive UX
- Async indexing
- Safe agent aborts

---

## 7. Definition of “Done”

- Context relevance exceeds Copilot / Cursor
- Agent actions are predictable and reversible
- Developers work faster without friction

---

## 8. Guiding Principle

> **LLMs are commodities.  
> Context is the product.**
