import { ToolCallState } from "core";
import { describe, expect, it, vi } from "vitest";
import { IIdeMessenger } from "../../context/IdeMessenger";
import { AppThunkDispatch } from "../store";
import { evaluateToolPolicies } from "./evaluateToolPolicies";

/**
 * Auto Mode 權限評估測試
 *
 * 測試 Auto Mode 啟用時的權限行為：
 * 1. 一般工具應該自動允許（allowedWithPermission → allowedWithoutPermission）
 * 2. 危險指令仍需確認（allowedWithPermission 保持不變）
 * 3. Edit 工具始終自動允許
 * 4. Disabled 工具保持 disabled
 */
describe("evaluateToolPolicies - Auto Mode", () => {
  const mockDispatch = vi.fn() as unknown as AppThunkDispatch;

  const createMockIdeMessenger = (
    policy: "allowedWithPermission" | "allowedWithoutPermission" | "disabled",
    displayValue?: string,
  ): IIdeMessenger => {
    return {
      request: vi.fn().mockResolvedValue({
        status: "success",
        content: { policy, displayValue },
      }),
    } as unknown as IIdeMessenger;
  };

  const createToolCallState = (
    toolName: string,
    args: Record<string, unknown> = {},
  ): ToolCallState => ({
    status: "generated",
    toolCall: {
      id: "test-id",
      type: "function",
      function: {
        name: toolName,
        arguments: JSON.stringify(args),
      },
    },
    toolCallId: "test-id",
    parsedArgs: args,
  });

  describe("Auto Mode 關閉時", () => {
    const isAutoMode = false;

    it("allowedWithPermission 工具應保持需要確認", async () => {
      const ideMessenger = createMockIdeMessenger("allowedWithPermission");
      const toolCallState = createToolCallState("readFile", {
        filepath: "test.ts",
      });

      const results = await evaluateToolPolicies(
        mockDispatch,
        ideMessenger,
        [],
        [toolCallState],
        {},
        isAutoMode,
      );

      expect(results[0].policy).toBe("allowedWithPermission");
    });

    it("allowedWithoutPermission 工具應自動允許（當 basePolicy 也是 allowedWithoutPermission）", async () => {
      const ideMessenger = createMockIdeMessenger("allowedWithoutPermission");
      const toolCallState = createToolCallState("readFile", {
        filepath: "test.ts",
      });

      // 提供一個 tool 定義，其 defaultToolPolicy 為 allowedWithoutPermission
      const mockTool = {
        function: { name: "readFile" },
        defaultToolPolicy: "allowedWithoutPermission" as const,
      };

      const results = await evaluateToolPolicies(
        mockDispatch,
        ideMessenger,
        [mockTool as any],
        [toolCallState],
        {},
        isAutoMode,
      );

      expect(results[0].policy).toBe("allowedWithoutPermission");
    });
  });

  describe("Auto Mode 開啟時", () => {
    const isAutoMode = true;

    it("一般工具應自動允許（allowedWithPermission → allowedWithoutPermission）", async () => {
      const ideMessenger = createMockIdeMessenger("allowedWithPermission");
      const toolCallState = createToolCallState("readFile", {
        filepath: "test.ts",
      });

      const results = await evaluateToolPolicies(
        mockDispatch,
        ideMessenger,
        [],
        [toolCallState],
        {},
        isAutoMode,
      );

      expect(results[0].policy).toBe("allowedWithoutPermission");
    });

    it("危險的 Bash 指令應仍需確認", async () => {
      const ideMessenger = createMockIdeMessenger(
        "allowedWithPermission",
        "rm -rf /home/user",
      );
      const dangerousCommands = [
        "rm -rf /home/user",
        "sudo apt install something",
        "chmod 777 /etc",
        "eval dangerous_code",
      ];

      for (const command of dangerousCommands) {
        const toolCallState = createToolCallState("runTerminalCommand", {
          command,
        });

        const results = await evaluateToolPolicies(
          mockDispatch,
          ideMessenger,
          [],
          [toolCallState],
          {},
          isAutoMode,
        );

        expect(results[0].policy).toBe("allowedWithPermission");
      }
    });

    it("安全的 Bash 指令應自動允許", async () => {
      const ideMessenger = createMockIdeMessenger("allowedWithPermission");
      const safeCommands = ["ls -la", "pwd", "git status", "npm test"];

      for (const command of safeCommands) {
        const toolCallState = createToolCallState("runTerminalCommand", {
          command,
        });

        const results = await evaluateToolPolicies(
          mockDispatch,
          ideMessenger,
          [],
          [toolCallState],
          {},
          isAutoMode,
        );

        expect(results[0].policy).toBe("allowedWithoutPermission");
      }
    });

    it("Edit 工具應始終自動允許", async () => {
      const ideMessenger = createMockIdeMessenger("allowedWithPermission");
      const editTools = [
        "editExistingFile",
        "singleFindAndReplace",
        "multiEdit",
      ];

      for (const toolName of editTools) {
        const toolCallState = createToolCallState(toolName, {
          filepath: "test.ts",
        });

        const results = await evaluateToolPolicies(
          mockDispatch,
          ideMessenger,
          [],
          [toolCallState],
          {},
          isAutoMode,
        );

        expect(results[0].policy).toBe("allowedWithoutPermission");
      }
    });

    it("Disabled 工具應保持 disabled", async () => {
      const ideMessenger = createMockIdeMessenger("disabled");
      const toolCallState = createToolCallState("someDisabledTool");

      const results = await evaluateToolPolicies(
        mockDispatch,
        ideMessenger,
        [],
        [toolCallState],
        {},
        isAutoMode,
      );

      expect(results[0].policy).toBe("disabled");
    });

    it("已經是 allowedWithoutPermission 的工具應保持不變", async () => {
      const ideMessenger = createMockIdeMessenger("allowedWithoutPermission");
      const toolCallState = createToolCallState("readFile", {
        filepath: "test.ts",
      });

      const results = await evaluateToolPolicies(
        mockDispatch,
        ideMessenger,
        [],
        [toolCallState],
        {},
        isAutoMode,
      );

      expect(results[0].policy).toBe("allowedWithoutPermission");
    });
  });
});
