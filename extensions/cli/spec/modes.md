# Modes

Modes are a system for managing tool permissions in the CLI. They can be set via command-line flags at startup or switched dynamically during chat sessions. The following modes are available:

## Available Modes

### `normal` (default)

The default mode that follows configured permission policies from `permissions.yaml` and command-line overrides without any additional restrictions or mode-specific policies.

- **UI Indicator:** No indicator shown (clean interface for default behavior)
- **Current directory:** Visible in status bar for context
- **Permission behavior:** Uses existing permission policies as configured
- **Backward compatibility:** Existing configurations work unchanged

### `plan`

Planning mode that **completely overrides all user permissions** to enforce read-only access with command execution. This mode prevents file modifications but allows command execution for analysis, regardless of user configuration.

- **Command-line flag:** `--readonly` (for backward compatibility)
- **UI Indicator:** `[plan]` shown in blue
- **Current directory:** Hidden to save space and focus on analysis
- **Permission override:** **Absolute** - excludes write tools (Write, Edit, etc.) and allows read tools (Read, Grep, LS, etc.) and Bash for command execution
- **User config ignored:** Any user `--allow` flags for write tools are overridden

### `auto`

Auto mode that allows most tools without asking, while still protecting against dangerous commands. This mode provides efficient automation while maintaining safety for destructive operations.

- **Command-line flag:** `--auto` (starts in auto mode)
- **UI Indicator:** `[auto]` shown in green
- **Current directory:** Hidden to save space and focus on automation
- **Permission behavior:**
  - Most tools are automatically allowed without confirmation
  - **Dangerous Bash commands still require confirmation** (see below)
  - User-defined `exclude` policies are respected
- **Safety protection:** Even in auto mode, dangerous commands require user confirmation

#### Dangerous Command Protection

The following types of Bash commands always require confirmation, even in auto mode:

- **Recursive deletion:** `rm -rf *`, `rm -r *`
- **Privilege escalation:** `sudo *`
- **Dangerous permissions:** `chmod 777 *`, `chmod -R 777 *`
- **Shell execution:** `eval *`, `exec *`
- **System modification:** `mkfs *`, `dd *`, `fdisk *`, `format *`
- **Download and execute:** `curl * | sh`, `wget * | bash`

This ensures that auto mode remains safe while still providing efficient automation for regular development tasks.

## Usage

### Command-Line Initialization

Modes can be set when starting the CLI:

```bash
cn --readonly "Help me analyze this code"  # Starts in plan mode
cn --auto "Fix all the linting errors"     # Starts in auto mode
cn "Let me implement this feature"         # Starts in normal mode (default)
```

### Dynamic Mode Switching

Users can switch modes during chat sessions using:

**Keyboard Shortcut:**

- **Shift+Tab** - Cycle through modes: normal → plan → auto → (repeat)

## Implementation

Modes are implemented through the permission system:

- **ToolPermissionService**: Rectifies current mode and tool policies
- **ModeIndicator**: UI component showing current mode (hidden for normal mode)
- **Keyboard shortcuts**: Shift+Tab cycles through modes instantly
- **Backward compatibility**: Existing `--readonly` flag maps to plan mode

### Mode Policy Priority

**Mode policies completely override all other configurations** when in plan or auto mode:

**Plan and Auto modes:**

1. **Mode policies** (absolute override - ignores everything else)

**Normal mode only:**

1. Command-line overrides (`--allow`, `--ask`, `--exclude`)
2. Permission configuration from `permissions.yaml`
3. Default tool policies

### Mode-Specific Behaviors

- **normal**: No mode policies applied, uses existing user configuration; shows current directory
- **plan**: **Absolute override** - excludes write tools (Write, Edit), allows read tools (Read, Grep, LS) and Bash; hides current directory
- **auto**: **Absolute override** - allows all tools with `*: allow` policy; hides current directory
