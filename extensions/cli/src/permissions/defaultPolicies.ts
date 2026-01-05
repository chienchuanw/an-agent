import { ToolPermissionPolicy } from "./types.js";

/**
 * 危險指令黑名單 - 這些指令即使在 Auto Mode 下也應該要求使用者確認
 *
 * 每個模式使用 glob 風格的匹配規則：
 * - * 匹配任意字串
 * - 精確字串匹配
 *
 * 這些模式會在 isDangerousCommand 函數中轉換為正則表達式
 */
export const DANGEROUS_COMMAND_PATTERNS: readonly string[] = [
  // 遞迴刪除指令 - 可能導致大量檔案遺失
  "rm -rf *",
  "rm -r *",

  // 提權指令 - 可能導致系統層級的更改
  "sudo *",

  // 權限過度開放 - 可能導致安全漏洞
  "chmod 777 *",
  "chmod -R 777 *",

  // Shell 執行指令 - 可能執行任意程式碼
  "eval *",
  "exec *",

  // 系統格式化/分割區指令 - 可能導致資料遺失
  "mkfs *",
  "mkfs.*",
  "dd *",
  "fdisk *",
  "format *",

  // 從網路下載並執行 - 可能執行惡意程式碼
  "curl * | sh",
  "curl * | bash",
  "wget * | sh",
  "wget * | bash",
] as const;

/**
 * 將 glob 風格模式轉換為正則表達式
 *
 * @param pattern - glob 風格模式，例如 "rm -rf *"
 * @returns 對應的正則表達式
 */
function patternToRegex(pattern: string): RegExp {
  // 轉義正則表達式特殊字元，但保留 * 作為萬用字元
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // 轉義特殊字元
    .replace(/\*/g, ".*"); // 將 * 轉換為 .*

  return new RegExp(`^${escaped}$`, "i");
}

/**
 * 檢查指令是否為危險指令
 *
 * 此函數會比對 DANGEROUS_COMMAND_PATTERNS 中的所有模式，
 * 如果指令匹配任何一個模式，則視為危險指令。
 *
 * @param command - 要檢查的指令字串
 * @returns 如果是危險指令則返回 true，否則返回 false
 *
 * @example
 * isDangerousCommand("rm -rf /") // true
 * isDangerousCommand("ls -la") // false
 * isDangerousCommand("sudo apt install") // true
 */
export function isDangerousCommand(command: string): boolean {
  const trimmedCommand = command.trim();

  for (const pattern of DANGEROUS_COMMAND_PATTERNS) {
    const regex = patternToRegex(pattern);
    if (regex.test(trimmedCommand)) {
      return true;
    }
  }

  return false;
}

/**
 * Default permission policies for all built-in tools.
 * These policies are applied in order - first match wins.
 */
export const DEFAULT_TOOL_POLICIES: ToolPermissionPolicy[] = [
  // Read-only tools are generally safe to allow
  { tool: "Read", permission: "allow" },
  { tool: "List", permission: "allow" },
  { tool: "Search", permission: "allow" },
  { tool: "Fetch", permission: "allow" },

  // Write operations should require confirmation
  { tool: "Write", permission: "ask" },
  { tool: "Edit", permission: "ask" },
  { tool: "MultiEdit", permission: "ask" },

  // Write to a checklist
  { tool: "Checklist", permission: "allow" },

  // Terminal commands should require confirmation by default
  { tool: "Bash", permission: "ask" },

  // Exit tool is generally safe (headless mode only)
  { tool: "Exit", permission: "allow" },

  // View diff is read-only
  { tool: "Diff", permission: "allow" },

  // Default fallback - ask for any unmatched tools
  { tool: "*", permission: "ask" },
];
