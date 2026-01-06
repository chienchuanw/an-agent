import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { MockIdeMessenger } from "../../context/MockIdeMessenger";
import sessionReducer from "../../redux/slices/sessionSlice";
import InlineErrorMessage from "./InlineErrorMessage";

// Helper to create a test store with specific inline error message
function createTestStore(inlineErrorMessage: any) {
  return configureStore({
    reducer: {
      session: sessionReducer,
    },
    preloadedState: {
      session: {
        isSessionMetadataLoading: false,
        allSessionMetadata: [],
        history: [],
        isStreaming: false,
        title: "Test Session",
        id: "test-id",
        streamAborter: new AbortController(),
        symbols: {},
        mode: "agent" as const,
        isInEdit: false,
        codeBlockApplyStates: {
          states: [],
          curIndex: 0,
        },
        newestToolbarPreviewForInput: {},
        compactionLoading: {},
        isAutoMode: false,
        inlineErrorMessage,
      },
    },
  });
}

describe("InlineErrorMessage", () => {
  describe("out-of-context error", () => {
    it("should render out-of-context error message", () => {
      const store = createTestStore("out-of-context");
      const mockIdeMessenger = new MockIdeMessenger();

      render(
        <Provider store={store}>
          <IdeMessengerContext.Provider value={mockIdeMessenger}>
            <InlineErrorMessage />
          </IdeMessengerContext.Provider>
        </Provider>,
      );

      expect(
        screen.getByText("Message exceeds context limit."),
      ).toBeInTheDocument();
    });

    it("should hide error when Hide button is clicked", async () => {
      const store = createTestStore("out-of-context");
      const mockIdeMessenger = new MockIdeMessenger();
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <IdeMessengerContext.Provider value={mockIdeMessenger}>
            <InlineErrorMessage />
          </IdeMessengerContext.Provider>
        </Provider>,
      );

      const hideButton = screen.getByText("Hide");
      await user.click(hideButton);

      // Verify the action was dispatched to clear the error
      const state = store.getState();
      expect(state.session.inlineErrorMessage).toBeUndefined();
    });
  });

  describe("stream-error", () => {
    it("should render stream error with short message and View error log link", () => {
      const streamError = {
        type: "stream-error" as const,
        error: new Error("Connection failed"),
        parsedError: "Connection failed: The server returned status code 500",
      };
      const store = createTestStore(streamError);
      const mockIdeMessenger = new MockIdeMessenger();

      render(
        <Provider store={store}>
          <IdeMessengerContext.Provider value={mockIdeMessenger}>
            <InlineErrorMessage />
          </IdeMessengerContext.Provider>
        </Provider>,
      );

      // Should show truncated error message
      expect(screen.getByText(/Connection failed/)).toBeInTheDocument();

      // Should show "View error log" link
      expect(screen.getByText("View error log")).toBeInTheDocument();

      // Should show "Hide" link
      expect(screen.getByText("Hide")).toBeInTheDocument();
    });

    it("should open dev tools when View error log link is clicked", async () => {
      const streamError = {
        type: "stream-error" as const,
        error: new Error("Test error"),
        parsedError: "Test error message",
      };
      const store = createTestStore(streamError);
      const mockIdeMessenger = new MockIdeMessenger();
      const postSpy = vi.spyOn(mockIdeMessenger, "post");
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <IdeMessengerContext.Provider value={mockIdeMessenger}>
            <InlineErrorMessage />
          </IdeMessengerContext.Provider>
        </Provider>,
      );

      const viewLogLink = screen.getByText("View error log");
      await user.click(viewLogLink);

      // Verify dev tools were opened
      expect(postSpy).toHaveBeenCalledWith("toggleDevTools", undefined);
    });

    it("should hide error when Hide button is clicked", async () => {
      const streamError = {
        type: "stream-error" as const,
        error: new Error("Test error"),
        parsedError: "Test error message",
      };
      const store = createTestStore(streamError);
      const mockIdeMessenger = new MockIdeMessenger();
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <IdeMessengerContext.Provider value={mockIdeMessenger}>
            <InlineErrorMessage />
          </IdeMessengerContext.Provider>
        </Provider>,
      );

      const hideButton = screen.getByText("Hide");
      await user.click(hideButton);

      // Verify the action was dispatched to clear the error
      const state = store.getState();
      expect(state.session.inlineErrorMessage).toBeUndefined();
    });

    it("should truncate long error messages", () => {
      const longError = "A".repeat(200);
      const streamError = {
        type: "stream-error" as const,
        error: new Error(longError),
        parsedError: longError,
      };
      const store = createTestStore(streamError);
      const mockIdeMessenger = new MockIdeMessenger();

      render(
        <Provider store={store}>
          <IdeMessengerContext.Provider value={mockIdeMessenger}>
            <InlineErrorMessage />
          </IdeMessengerContext.Provider>
        </Provider>,
      );

      // Should truncate to 100 characters with ellipsis
      const errorText = screen.getByText(/^Error:/);
      // "Error: " (7) + 100 chars + "..." (3) = 110 total
      expect(errorText.textContent).toHaveLength(110);
      expect(errorText.textContent).toContain("...");
    });
  });

  describe("no error", () => {
    it("should render nothing when no error is present", () => {
      const store = createTestStore(undefined);
      const mockIdeMessenger = new MockIdeMessenger();

      const { container } = render(
        <Provider store={store}>
          <IdeMessengerContext.Provider value={mockIdeMessenger}>
            <InlineErrorMessage />
          </IdeMessengerContext.Provider>
        </Provider>,
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
