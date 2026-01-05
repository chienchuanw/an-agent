import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { createMockStore } from "../../../util/test/mockStore";
import AutoModeToggle from "./AutoModeToggle";

/**
 * AutoModeToggle 組件測試
 *
 * 測試 Auto Mode 切換按鈕的行為：
 * - 正確渲染開關狀態
 * - 點擊事件正確觸發
 * - 與 Redux store 正確連接
 */
describe("AutoModeToggle", () => {
  const renderWithStore = (sessionOverrides: Record<string, unknown> = {}) => {
    const store = createMockStore({
      session: {
        isAutoMode: false,
        mode: "agent",
        ...sessionOverrides,
      } as any,
    });
    return {
      store,
      ...render(
        <Provider store={store}>
          <AutoModeToggle />
        </Provider>,
      ),
    };
  };

  describe("渲染行為", () => {
    it("should render toggle in agent mode", () => {
      renderWithStore({ mode: "agent" });

      // 應該顯示 Auto Mode 開關
      expect(screen.getByTestId("auto-mode-toggle")).toBeInTheDocument();
    });

    it("should not render in chat mode", () => {
      renderWithStore({ mode: "chat" });

      // 在 chat 模式下不應該顯示
      expect(screen.queryByTestId("auto-mode-toggle")).not.toBeInTheDocument();
    });

    it("should not render in edit mode", () => {
      renderWithStore({ mode: "edit" });

      // 在 edit 模式下不應該顯示
      expect(screen.queryByTestId("auto-mode-toggle")).not.toBeInTheDocument();
    });

    it("should show unchecked state when isAutoMode is false", () => {
      renderWithStore({ isAutoMode: false, mode: "agent" });

      const toggle = screen.getByTestId("auto-mode-toggle");
      expect(toggle).toHaveAttribute("aria-checked", "false");
    });

    it("should show checked state when isAutoMode is true", () => {
      renderWithStore({ isAutoMode: true, mode: "agent" });

      const toggle = screen.getByTestId("auto-mode-toggle");
      expect(toggle).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("互動行為", () => {
    it("should dispatch setAutoMode(true) when clicked while off", async () => {
      const { store } = renderWithStore({ isAutoMode: false, mode: "agent" });
      const user = userEvent.setup();

      const toggle = screen.getByTestId("auto-mode-toggle");
      await user.click(toggle);

      // 檢查 action 是否被 dispatch
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: "session/setAutoMode",
          payload: true,
        }),
      );
    });

    it("should dispatch setAutoMode(false) when clicked while on", async () => {
      const { store } = renderWithStore({ isAutoMode: true, mode: "agent" });
      const user = userEvent.setup();

      const toggle = screen.getByTestId("auto-mode-toggle");
      await user.click(toggle);

      // 檢查 action 是否被 dispatch
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: "session/setAutoMode",
          payload: false,
        }),
      );
    });
  });
});
