# Continue - VSCode Extension

The leading open-source AI code agent for VSCode.

## Features

### Agent

[Agent](https://docs.continue.dev/features/agent/quick-start) to work on development tasks together with AI

![agent](docs/images/agent.gif)

### Chat

[Chat](https://docs.continue.dev/features/chat/quick-start) to ask general questions and clarify code sections

![chat](docs/images/chat.gif)

### Edit

[Edit](https://docs.continue.dev/features/edit/quick-start) to modify a code section without leaving your current file

![edit](docs/images/edit.gif)

### Autocomplete

[Autocomplete](https://docs.continue.dev/features/autocomplete/quick-start) to receive inline code suggestions as you type

![autocomplete](docs/images/autocomplete.gif)

---

## 本地開發與打包指南

本節說明如何在本地進行版本管理、打包和安裝 Continue VSCode 擴充套件。

### 前置需求

- Node.js >= 20.19.0
- npm 或 pnpm
- VSCode >= 1.70.0
- Git

### 版本管理流程

#### 1. 決定版本號

遵循 [Semantic Versioning](https://semver.org/) 規範:

```text
MAJOR.MINOR.PATCH (例如: 1.3.29)
  │      │      │
  │      │      └─ PATCH: Bug 修復、小改進 (1.3.28 → 1.3.29)
  │      └────── MINOR: 新功能,向後相容 (1.3.0 → 1.4.0)
  └──────────── MAJOR: 重大變更,可能不相容 (1.0.0 → 2.0.0)
```

**決策指南:**

- 修復 bug → 增加 PATCH
- 新增功能 → 增加 MINOR
- 破壞性變更 → 增加 MAJOR

#### 2. 更新版本號

編輯 `extensions/vscode/package.json`,更新 `version` 欄位:

```json
{
  "name": "continue",
  "version": "1.3.29"
}
```

#### 3. 提交版本變更

```bash
cd /path/to/continue-an-agent
git add extensions/vscode/package.json
git commit -m "chore(release): bump version to 1.3.29"
```

#### 4. 建立 Git Tag

```bash
# 建立 annotated tag (推薦)
git tag -a v1.3.29 -m "Release v1.3.29 - Fix auto mode permission"

# 或簡單版本
git tag v1.3.29
```

**Tag 命名慣例:**

- 使用 `v` 前綴: `v1.3.29`
- 與 package.json 版本號保持一致

**查看已建立的 tag:**

```bash
git tag -l
git show v1.3.29
```

**刪除 tag (如果出錯):**

```bash
# 刪除本地 tag
git tag -d v1.3.29

# 刪除遠端 tag (如果已推送)
git push origin --delete v1.3.29
```

---

### 本地打包 VSIX

#### 步驟 1: 進入擴充套件目錄

```bash
cd extensions/vscode
```

#### 步驟 2: 執行預打包

此步驟會準備所有必要的檔案:

```bash
npm run prepackage
```

**此步驟會:**

- 安裝依賴
- 編譯 TypeScript → JavaScript
- 建置 GUI (React 應用)
- 複製 native modules (SQLite, LanceDB 等)
- 準備 tree-sitter WASM 檔案

#### 步驟 3: 打包成 VSIX

```bash
npm run package
```

**輸出:**

- VSIX 檔案位置: `extensions/vscode/build/continue-1.3.29.vsix`
- 檔案大小: 通常 100-200MB (包含所有依賴)

#### 步驟 4: 驗證打包結果

```bash
ls -lh build/*.vsix
```

**跨平台打包 (可選):**

如果需要為多個平台打包:

```bash
npm run package-all
```

此命令會為以下平台建立 VSIX:

- Windows (x64)
- Linux (x64, arm64)
- macOS (x64, arm64)

---

### 安裝擴充套件

#### 方法 1: 使用命令列安裝 (推薦)

```bash
code --install-extension extensions/vscode/build/continue-1.3.29.vsix
```

#### 方法 2: 在 VSCode 中手動安裝

1. 打開 VSCode
2. 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
3. 輸入 "Install from VSIX"
4. 選擇 `extensions/vscode/build/continue-1.3.29.vsix`

#### 方法 3: 拖放安裝

1. 打開 VSCode 的擴充套件面板 (`Cmd+Shift+X`)
2. 點擊右上角的 "..." 選單
3. 選擇 "Install from VSIX..."
4. 選擇 VSIX 檔案

**驗證安裝:**

```bash
# 列出已安裝的擴充套件
code --list-extensions | grep -i continue
```

---

### 解除安裝擴充套件

#### 方法 1: 使用命令列解除安裝

```bash
code --uninstall-extension Continue.continue
```

#### 方法 2: 在 VSCode 中手動解除安裝

1. 打開擴充套件面板 (`Cmd+Shift+X`)
2. 搜尋 "Continue"
3. 點擊擴充套件卡片上的齒輪圖示
4. 選擇 "Uninstall"

#### 方法 3: 完全移除擴充套件資料

解除安裝後,如果想完全移除所有設定和快取:

```bash
# macOS
rm -rf ~/.vscode/extensions/Continue.continue-*
rm -rf ~/Library/Application\ Support/Code/User/globalStorage/Continue.continue

# Linux
rm -rf ~/.vscode/extensions/Continue.continue-*
rm -rf ~/.config/Code/User/globalStorage/Continue.continue

# Windows
rmdir /s "%USERPROFILE%\.vscode\extensions\Continue.continue-*"
rmdir /s "%APPDATA%\Code\User\globalStorage\Continue.continue"
```

---

### 版本管理最佳實踐

#### 安裝新版本前的準備

```bash
# 1. 備份舊版本 (可選)
cp ~/.vscode/extensions/Continue.continue-1.3.28 \
   ~/.vscode/extensions/Continue.continue-1.3.28.backup

# 2. 解除安裝舊版本
code --uninstall-extension Continue.continue

# 3. 安裝新版本
code --install-extension extensions/vscode/build/continue-1.3.29.vsix
```

#### 檢查已安裝的版本

```bash
# 列出 Continue 的所有版本
ls -la ~/.vscode/extensions/ | grep -i continue

# 查看特定版本的資訊
cat ~/.vscode/extensions/Continue.continue-1.3.29/package.json | grep version
```

#### 快速切換版本

```bash
# 列出所有已安裝的版本
code --list-extensions --show-versions | grep -i continue

# 解除安裝當前版本
code --uninstall-extension Continue.continue

# 安裝特定版本
code --install-extension path/to/continue-1.3.28.vsix
```

---

### 常見問題

**Q: 打包失敗,提示找不到檔案?**

A: 確保執行了 `npm run prepackage`:

```bash
npm run prepackage
npm run package
```

**Q: 安裝後擴充套件沒有出現?**

A: 嘗試重啟 VSCode 或執行:

```bash
code --reload-window
```

**Q: 如何確認安裝的是正確版本?**

A: 在 VSCode 中:

1. 打開擴充套件面板 (`Cmd+Shift+X`)
2. 搜尋 "Continue"
3. 查看版本號

或使用命令列:

```bash
code --list-extensions --show-versions | grep -i continue
```

**Q: 可以同時安裝多個版本嗎?**

A: 不可以。VSCode 只允許安裝一個版本的擴充套件。需要先解除安裝舊版本才能安裝新版本。

**Q: 如何回滾到舊版本?**

A:

```bash
# 1. 解除安裝當前版本
code --uninstall-extension Continue.continue

# 2. 安裝舊版本
code --install-extension path/to/continue-1.3.28.vsix
```

---

### 開發工作流程

**完整的發布流程:**

```bash
# 1. 開發功能/修復 bug
# ... 編輯程式碼 ...

# 2. 測試確認無誤
npm run test

# 3. 更新版本號
# 編輯 extensions/vscode/package.json

# 4. 提交版本變更
git add extensions/vscode/package.json
git commit -m "chore(release): bump version to 1.3.29"

# 5. 建立 Git Tag
git tag -a v1.3.29 -m "Release v1.3.29"

# 6. 打包 VSIX
cd extensions/vscode
npm run prepackage
npm run package

# 7. 測試安裝
code --uninstall-extension Continue.continue
code --install-extension build/continue-1.3.29.vsix

# 8. (可選) 推送到遠端
git push origin main --tags
```

---

## License

[Apache 2.0 © 2023-2025 Continue Dev, Inc.](./LICENSE)
