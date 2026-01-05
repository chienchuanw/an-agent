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

## Local Development and Packaging Guide

This section explains how to manage versions, package, and install the Continue VSCode extension locally.

### Prerequisites

- Node.js >= 20.19.0

- npm or pnpm
- VSCode >= 1.70.0
- Git

### Version Management Workflow

#### 1. Determine Version Number

Follow [Semantic Versioning](https://semver.org/) conventions:

```text

MAJOR.MINOR.PATCH (e.g.: 1.3.29)
  │      │      │



  │      │      └─ PATCH: Bug fixes, minor improvements (1.3.28 → 1.3.29)
  │      └────── MINOR: New features, backward compatible (1.3.0 → 1.4.0)
  └──────────── MAJOR: Breaking changes, potentially incompatible (1.0.0 → 2.0.0)
```

**Decision Guide:**

- Bug fix → increment PATCH
- New feature → increment MINOR
- Breaking change → increment MAJOR

#### 2. Update Version Number

Edit `extensions/vscode/package.json` and update the `version` field:

```json
{
  "name": "continue",
  "version": "1.3.29"
}
```

#### 3. Commit Version Changes

```bash
cd /path/to/continue-an-agent
git add extensions/vscode/package.json
git commit -m "chore(release): bump version to 1.3.29"
```

#### 4. Create Git Tag

```bash

# Create annotated tag (recommended)
git tag -a v1.3.29 -m "Release v1.3.29 - Fix auto mode permission"


# Or simple version
git tag v1.3.29
```

**Tag Naming Convention:**

- Use `v` prefix: `v1.3.29`
- Keep consistent with package.json version number

**View created tags:**

```bash
git tag -l
git show v1.3.29
```

**Delete tag (if error occurred):**

```bash

# Delete local tag
git tag -d v1.3.29


# Delete remote tag (if already pushed)
git push origin --delete v1.3.29
```

---

### Local VSIX Packaging

#### Step 1: Enter the Extension Directory

```bash
cd extensions/vscode
```

#### Step 2: Run Pre-packaging

This step prepares all necessary files:

```bash
npm run prepackage
```

**This step will:**

- Install dependencies
- Compile TypeScript → JavaScript
- Build the GUI (React application)
- Copy native modules (SQLite, LanceDB, etc.)
- Prepare tree-sitter WASM files

#### Step 3: Package as VSIX

```bash
npm run package
```

**Output:**

- VSIX file location: `extensions/vscode/build/continue-1.3.29.vsix`
- File size: typically 100-200MB (includes all dependencies)

#### Step 4: Verify Packaging Result

```bash
ls -lh build/*.vsix
```

**Cross-platform Packaging (Optional):**

If you need to package for multiple platforms:

```bash
npm run package-all
```

This command will create VSIX for the following platforms:

- Windows (x64)
- Linux (x64, arm64)
- macOS (x64, arm64)

---

### Installing the Extension

#### Method 1: Install via Command Line (Recommended)

```bash
code --install-extension extensions/vscode/build/continue-1.3.29.vsix
```

#### Method 2: Manual Installation in VSCode

1. Open VSCode
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Install from VSIX"
4. Select `extensions/vscode/build/continue-1.3.29.vsix`

#### Method 3: Drag and Drop Installation

1. Open VSCode's Extensions panel (`Cmd+Shift+X`)
2. Click the "..." menu in the top right
3. Select "Install from VSIX..."
4. Select the VSIX file

**Verify Installation:**

```bash

# List installed extensions
code --list-extensions | grep -i continue
```

---

### Uninstalling the Extension

#### Method 1: Uninstall via Command Line

```bash
code --uninstall-extension Continue.continue
```

#### Method 2: Manual Uninstall in VSCode

1. Open the Extensions panel (`Cmd+Shift+X`)
2. Search for "Continue"
3. Click the gear icon on the extension card
4. Select "Uninstall"

#### Method 3: Completely Remove Extension Data

After uninstalling, if you want to completely remove all settings and cache:

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

### Version Management Best Practices

#### Preparation Before Installing a New Version

```bash

# 1. Back up the old version (optional)
cp ~/.vscode/extensions/Continue.continue-1.3.28 \
   ~/.vscode/extensions/Continue.continue-1.3.28.backup


# 2. Uninstall the old version
code --uninstall-extension Continue.continue


# 3. Install the new version
code --install-extension extensions/vscode/build/continue-1.3.29.vsix
```

#### Check Installed Versions

```bash

# List all versions of Continue
ls -la ~/.vscode/extensions/ | grep -i continue


# View information about a specific version
cat ~/.vscode/extensions/Continue.continue-1.3.29/package.json | grep version
```

#### Quick Version Switching

```bash

# List all installed versions
code --list-extensions --show-versions | grep -i continue


# Uninstall the current version
code --uninstall-extension Continue.continue


# Install a specific version
code --install-extension path/to/continue-1.3.28.vsix
```

---

### FAQ

**Q: Packaging failed with "file not found" error?**

A: Make sure you ran `npm run prepackage`:

```bash
npm run prepackage
npm run package
```

**Q: The extension doesn't appear after installation?**

A: Try restarting VSCode or running:

```bash
code --reload-window
```

**Q: How do I verify that I installed the correct version?**

A: In VSCode:

1. Open the Extensions panel (`Cmd+Shift+X`)
2. Search for "Continue"
3. Check the version number

Or use the command line:

```bash
code --list-extensions --show-versions | grep -i continue
```

**Q: Can I install multiple versions at the same time?**

A: No. VSCode only allows installing one version of an extension. You must uninstall the old version before installing a new one.

**Q: How do I roll back to an old version?**

A:

```bash

# 1. Uninstall the current version
code --uninstall-extension Continue.continue


# 2. Install the old version
code --install-extension path/to/continue-1.3.28.vsix
```

---

### Development Workflow

**Complete release process:**

```bash


# 1. Develop features/fix bugs
# ... edit code ...


# 2. Test to ensure it works
npm run test



# 3. Update version number
# Edit extensions/vscode/package.json


# 4. Commit version changes
git add extensions/vscode/package.json
git commit -m "chore(release): bump version to 1.3.29"


# 5. Create Git Tag
git tag -a v1.3.29 -m "Release v1.3.29"


# 6. Package VSIX
cd extensions/vscode
npm run prepackage
npm run package


# 7. Test installation
code --uninstall-extension Continue.continue
code --install-extension build/continue-1.3.29.vsix


# 8. (Optional) Push to remote
git push origin main --tags
```

---

## License

[Apache 2.0 © 2023-2025 Continue Dev, Inc.](./LICENSE)
