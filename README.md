# agent-naan

**VSCode-native AI Assistant with Advanced Context Engine**

A Continue.dev fork with Claude 4.5 as the primary LLM, featuring a sophisticated Context Engine that decides what information the model should see based on intent, relevance, and token budgets.

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or 20.x ([Download](https://nodejs.org/))
- **pnpm** 8.x or higher (`npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (for development and testing)

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/chienchuanw/continue-an-agent.git
   cd continue-an-agent
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env  # if available, or create manually
   ```

   Add your API keys:

   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. **Verify the setup**

   ```bash
   pnpm format:check
   ```

## Building the Project

### Development Mode

For active development with watch mode:

```bash
# Watch TypeScript compilation for all modules
pnpm tsc:watch
```

This will watch and compile:

- GUI (`gui/`)
- VS Code Extension (`extensions/vscode/`)
- Core Engine (`core/`)
- Binary (`binary/`)

### Production Build

To create a production-ready build:

```bash
# Build all modules
pnpm build
```

### Code Quality

Before committing, ensure code quality:

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Run linter
pnpm lint
```

## Building and Running the VSCode Extension

### Prerequisites for Extension Development

- VS Code installed on your machine
- All project dependencies installed (`pnpm install`)
- Node.js 18.x or 20.x

### Build the Extension

1. **Build the extension code**

   ```bash
   # Navigate to the VSCode extension directory
   cd extensions/vscode

   # Install extension-specific dependencies
   pnpm install

   # Build the extension
   pnpm build
   ```

2. **Watch mode for development** (recommended)

   ```bash
   # From the root directory, watch all modules including the extension
   pnpm tsc:watch

   # Or from the extension directory specifically
   cd extensions/vscode
   pnpm watch
   ```

### Run the Extension Locally

1. **Open the extension in VS Code**

   ```bash
   # From the extensions/vscode directory
   code .
   ```

2. **Launch the Extension Development Host**

   - Press `F5` in VS Code, or
   - Go to Run menu > Start Debugging, or
   - Use the keyboard shortcut `Ctrl+F5` (Windows/Linux) or `Cmd+F5` (macOS)

   This will open a new VS Code window with the extension loaded.

3. **Test the extension**

   - The extension will be active in the new window
   - Open any project folder to test the extension functionality
   - Use the VS Code Developer Tools to debug:
     - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (macOS) to open DevTools
     - Check the Console tab for any errors or logs

### Package the Extension

To create a distributable `.vsix` file:

```bash
# Install vsce (VS Code Extension CLI) globally if not already installed
npm install -g @vscode/vsce

# Navigate to the extension directory
cd extensions/vscode

# Package the extension
vsce package
```

This will create a `.vsix` file in the `extensions/vscode` directory.

### Install the Extension Locally

To install the packaged extension in your local VS Code:

```bash
# Using the VS Code CLI
code --install-extension agent-naan-0.0.1.vsix

# Or manually:
# 1. Open VS Code
# 2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
# 3. Click the "..." menu at the top
# 4. Select "Install from VSIX..."
# 5. Choose the .vsix file
```

### Debugging the Extension

1. **Set breakpoints** in the extension code (in the VS Code editor)
2. **Open the Debug Console** in the Extension Development Host window
3. **Reload the extension** by pressing `Ctrl+R` (Windows/Linux) or `Cmd+R` (macOS) in the Extension Development Host
4. **Trigger the extension** to hit your breakpoints

### Common Extension Development Tasks

**Rebuild after changes:**

```bash
# If using watch mode, changes are compiled automatically
# Otherwise, rebuild manually:
cd extensions/vscode
pnpm build
```

**Clear extension cache:**

```bash
# If the extension behaves unexpectedly, clear the cache
rm -rf extensions/vscode/out
pnpm build
```

**View extension logs:**

- Open the Extension Development Host window
- Go to View > Output
- Select "agent-naan" from the dropdown to see extension logs

### Troubleshooting Extension Issues

**Extension not loading:**

- Check the Output panel for error messages
- Verify all dependencies are installed: `pnpm install`
- Rebuild the extension: `pnpm build`
- Restart the Extension Development Host (press `Ctrl+R` / `Cmd+R`)

**TypeScript errors in extension:**

```bash
# Check for type errors
cd extensions/vscode
pnpm tsc --noEmit
```

**Port conflicts:**

If the extension uses a local server, ensure the port is not in use:

```bash
# macOS/Linux: Find process using port 3000
lsof -i :3000

# Windows: Find process using port 3000
netstat -ano | findstr :3000
```

## Project Structure

```text
agent-naan/
├── core/                 # Core Engine (editor-agnostic)
│   ├── context/         # Context Engine (retrieval, ranking, packing)
│   ├── llm/             # LLM abstraction layer
│   ├── agent/           # Agent runtime
│   └── prompt/          # Prompt assembly
├── extensions/
│   ├── vscode/          # VS Code extension
│   └── intellij/        # JetBrains extension
├── gui/                 # Web UI components
├── binary/              # CLI binary
├── packages/            # Shared packages
├── docs/                # Documentation
└── .augment/            # Augment Code rules & guidelines
    └── rules/
        ├── coding-standards.md
        ├── project-guidelines.md
        └── workflow.md
```

## Testing

Run tests to ensure everything works:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Architecture and design guidance
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/architecture.md](./docs/architecture.md)** - System architecture
- **[docs/context-engine.md](./docs/context-engine.md)** - Context Engine specification
- **[.augment/rules/](./augment/rules/)** - Coding standards and guidelines

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### Making Changes

1. Make your code changes
2. Run formatting: `pnpm format`
3. Run type checking: `pnpm tsc:watch`
4. Run tests: `pnpm test`
5. Commit with conventional commits: `git commit -m "feat(scope): description"`

### Pushing Changes

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub.

## Troubleshooting

### Dependencies not installing

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript errors

```bash
# Check for type errors
pnpm tsc:watch

# Fix formatting issues
pnpm format
```

### Port already in use

If you encounter port conflicts, check which process is using the port and terminate it, or modify the port configuration in the respective module's config file.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Key Features

- **Context Engine** - Intelligent retrieval system that decides what information the model should see
- **VSCode Integration** - Native VS Code extension for seamless IDE integration
- **Claude 4.5** - Advanced LLM with superior reasoning capabilities
- **Modular Architecture** - Strict separation of concerns with clear module boundaries
- **Human-in-the-Loop** - All file mutations require explicit user approval

## Project Goals

- Match or exceed Augment Code in context relevance and suggestion precision
- Provide a non-intrusive UX integrated directly into VS Code
- Maintain strict architectural boundaries for reliability and maintainability
- Enable human-controlled AI assistance with predictable behavior

</div>

## License

[Apache 2.0 © 2023-2024 Continue Dev, Inc.](./LICENSE)

## Community

- **Discord**: [Join our community](https://discord.gg/vapESyrFmJ)
- **Issues**: [Report bugs or request features](https://github.com/chienchuanw/continue-an-agent/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/chienchuanw/continue-an-agent/discussions)

---
