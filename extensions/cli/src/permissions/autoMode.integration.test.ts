/**
 * Auto Mode 整合測試
 *
 * 這些測試驗證 Auto Mode 功能的完整流程：
 * 1. Auto Mode 開關狀態影響權限檢查
 * 2. 一般工具在 Auto Mode 下自動允許
 * 3. 危險指令即使在 Auto Mode 下也需要確認
 */
import { describe, expect, it } from "vitest";
import { isDangerousCommand } from "./defaultPolicies.js";
import { checkToolPermissionWithAutoMode } from "./permissionChecker.js";
import { ToolPermissions } from "./types.js";

describe("Auto Mode Integration Tests", () => {
  const emptyPermissions: ToolPermissions = { policies: [] };

  describe("完整流程測試：Auto Mode 開啟時", () => {
    const isAutoMode = true;

    it("Read 工具應該自動允許", () => {
      const result = checkToolPermissionWithAutoMode(
        { name: "Read", arguments: { path: "/project/src/index.ts" } },
        emptyPermissions,
        isAutoMode,
      );

      expect(result.permission).toBe("allow");
    });

    it("Write 工具應該自動允許", () => {
      const result = checkToolPermissionWithAutoMode(
        {
          name: "Write",
          arguments: { path: "/project/src/new-file.ts", content: "// code" },
        },
        emptyPermissions,
        isAutoMode,
      );

      expect(result.permission).toBe("allow");
    });

    it("安全的 Bash 指令（ls, pwd, git status）應該自動允許", () => {
      const safeCommands = [
        "ls -la",
        "pwd",
        "git status",
        "npm test",
        "echo hello",
        "cat file.txt",
        "grep pattern file.txt",
      ];

      for (const command of safeCommands) {
        const result = checkToolPermissionWithAutoMode(
          { name: "Bash", arguments: { command } },
          emptyPermissions,
          isAutoMode,
        );

        expect(result.permission).toBe("allow");
      }
    });

    it("危險的 Bash 指令（rm -rf, sudo）應該要求確認", () => {
      // 只使用 DANGEROUS_COMMAND_PATTERNS 中實際定義的危險指令
      const dangerousCommands = [
        "rm -rf /home/user",
        "rm -r /tmp/important",
        "sudo apt install something",
        "chmod 777 /etc",
        "chmod -R 777 /var",
        "eval dangerous_code",
        "exec bash",
        "mkfs /dev/sda1",
        "dd if=/dev/zero of=/dev/sda",
      ];

      for (const command of dangerousCommands) {
        // 先驗證這些確實被認定為危險指令
        expect(isDangerousCommand(command)).toBe(true);

        const result = checkToolPermissionWithAutoMode(
          { name: "Bash", arguments: { command } },
          emptyPermissions,
          isAutoMode,
        );

        expect(result.permission).toBe("ask");
      }
    });
  });

  describe("完整流程測試：Auto Mode 關閉時", () => {
    const isAutoMode = false;

    it("工具應該遵循預設的權限政策", () => {
      const result = checkToolPermissionWithAutoMode(
        { name: "Read", arguments: { path: "/project/src/index.ts" } },
        emptyPermissions,
        isAutoMode,
      );

      // 預設應該是 ask
      expect(result.permission).toBe("ask");
    });

    it("有明確 allow 政策的工具應該被允許", () => {
      const permissions: ToolPermissions = {
        policies: [{ tool: "Read", permission: "allow" }],
      };

      const result = checkToolPermissionWithAutoMode(
        { name: "Read", arguments: { path: "/project/src/index.ts" } },
        permissions,
        isAutoMode,
      );

      expect(result.permission).toBe("allow");
    });

    it("有明確 exclude 政策的工具應該被排除", () => {
      const permissions: ToolPermissions = {
        policies: [{ tool: "DangerousTool", permission: "exclude" }],
      };

      const result = checkToolPermissionWithAutoMode(
        { name: "DangerousTool", arguments: {} },
        permissions,
        isAutoMode,
      );

      expect(result.permission).toBe("exclude");
    });
  });

  describe("Exclude 政策在 Auto Mode 下的行為", () => {
    it("被 exclude 的工具即使在 Auto Mode 下也應該被排除", () => {
      const permissions: ToolPermissions = {
        policies: [{ tool: "RestrictedTool", permission: "exclude" }],
      };

      const result = checkToolPermissionWithAutoMode(
        { name: "RestrictedTool", arguments: {} },
        permissions,
        true, // isAutoMode
      );

      expect(result.permission).toBe("exclude");
    });
  });
});
