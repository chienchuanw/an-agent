# Inline Error Display Implementation

## 概要

成功將 session 終止時的錯誤顯示方式從 popup modal 改為 inline 顯示，使用者可以點擊「View error log」超連結查看詳細的錯誤訊息。

## 實作內容

### 1. 擴展 InlineErrorMessage 組件

**檔案**: `gui/src/components/mainInput/InlineErrorMessage.tsx`

- 新增 `stream-error` 錯誤類型支援
- 擴展 `InlineErrorMessageType` 類型定義：
  ```typescript
  export type InlineErrorMessageType =
    | "out-of-context"
    | {
        type: "stream-error";
        error: unknown;
        parsedError: string;
      };
  ```
- 實作錯誤訊息截斷邏輯（最多顯示 100 字元）
- 新增「View error log」超連結，點擊後開啟 DevTools
- 保持向後相容性，現有 `out-of-context` 錯誤類型維持不變

### 2. 修改錯誤處理邏輯

**檔案**: `gui/src/redux/thunks/streamThunkWrapper.tsx`

- 移除 popup modal 的顯示邏輯（`setDialogMessage` 和 `setShowDialog`）
- 改用 `setInlineErrorMessage` action 設定 inline 錯誤
- 錯誤資訊包含：
  - `type`: "stream-error"
  - `error`: 原始錯誤物件
  - `parsedError`: 解析後的錯誤訊息字串

### 3. 完整測試覆蓋

**測試檔案**:

- `gui/src/components/mainInput/InlineErrorMessage.test.tsx` (新增)
- `gui/src/redux/thunks/streamResponse_errorHandling.test.ts` (更新)
- `gui/src/redux/thunks/streamResponse_toolCalls.test.ts` (更新)

測試涵蓋：

- ✅ `out-of-context` 錯誤顯示和隱藏
- ✅ `stream-error` 錯誤顯示和截斷
- ✅ 「View error log」連結開啟 DevTools
- ✅ 「Hide」按鈕清除錯誤訊息
- ✅ 長錯誤訊息自動截斷
- ✅ 無錯誤時不顯示任何內容
- ✅ 錯誤處理流程的 Redux action 序列

## TDD 開發流程

遵循標準 TDD（測試驅動開發）流程：

1. **Red Phase**: 先寫測試，確認測試失敗

   - 創建 `InlineErrorMessage.test.tsx` 測試新功能
   - 更新 `streamResponse_errorHandling.test.ts` 測試新的錯誤處理流程

2. **Green Phase**: 實作功能讓測試通過

   - 擴展 `InlineErrorMessage.tsx` 組件
   - 修改 `streamThunkWrapper.tsx` 錯誤處理邏輯
   - 確保所有測試通過

3. **Refactor Phase**: 程式碼優化和整理
   - 確保程式碼符合專案風格
   - 更新相關測試以適應新的參數（`actionId`）

## Git Commits

```
67ae6936a test: add InlineErrorMessage tests for stream-error type
48d07610e feat(ui): replace error popup modal with inline error display
590d01a2d test: update tool call tests to include actionId in streamNormalInput
```

## 使用者體驗改善

### 之前 (Popup Modal)

- ❌ 錯誤發生時彈出 modal，遮擋整個畫面
- ❌ 使用者必須關閉 modal 才能繼續操作
- ❌ 錯誤訊息與對話脈絡分離

### 之後 (Inline Display)

- ✅ 錯誤訊息顯示在對話底部，與脈絡保持一致
- ✅ 不阻礙使用者繼續操作
- ✅ 簡短錯誤訊息 + 可選的詳細資訊（通過 DevTools）
- ✅ 可隨時隱藏錯誤訊息

## 技術細節

### 錯誤訊息截斷邏輯

```typescript
const truncatedError =
  inlineErrorMessage.parsedError.length > 100
    ? inlineErrorMessage.parsedError.slice(0, 100) + "..."
    : inlineErrorMessage.parsedError;
```

### DevTools 開啟機制

```typescript
onClick={() => {
  ideMessenger.post("toggleDevTools", undefined);
}}
```

### 錯誤狀態管理

錯誤狀態儲存在 Redux session slice 中：

```typescript
session: {
  inlineErrorMessage?: InlineErrorMessageType;
  // ... other state
}
```

## 向後相容性

✅ 保持與現有 `out-of-context` 錯誤類型的完全相容
✅ 不影響其他錯誤處理流程
✅ 所有現有測試維持通過

## 測試結果

```
Test Files  4 passed (4)
     Tests  26 passed (26)
```

所有與此功能相關的測試均通過。

## 未來改進建議

1. 考慮添加更多錯誤類型（如網路錯誤、權限錯誤等）
2. 提供錯誤訊息本地化支援
3. 添加錯誤統計和追蹤
4. 提供更多錯誤自動修復建議
