import { useContext } from "react";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setInlineErrorMessage } from "../../redux/slices/sessionSlice";

export type InlineErrorMessageType =
  | "out-of-context"
  | {
      type: "stream-error";
      error: unknown;
      parsedError: string;
    };

export default function InlineErrorMessage() {
  const dispatch = useAppDispatch();
  const ideMessenger = useContext(IdeMessengerContext);
  const inlineErrorMessage = useAppSelector(
    (state) => state.session.inlineErrorMessage,
  );
  if (inlineErrorMessage === "out-of-context") {
    return (
      <div
        className={`border-border relative m-2 flex flex-col rounded-md border border-solid bg-transparent p-4`}
      >
        <p className={`thread-message text-error text-center`}>
          {`Message exceeds context limit.`}
        </p>
        <div className="text-description flex flex-row items-center justify-center gap-1.5 px-3">
          <div
            className="cursor-pointer text-xs hover:underline"
            onClick={() => {
              ideMessenger.post("config/openProfile", {
                profileId: undefined,
              });
            }}
          >
            <span className="xs:flex hidden">Open config</span>
            <span className="xs:hidden">Config</span>
          </div>
          |
          <span
            className="cursor-pointer text-xs hover:underline"
            onClick={() => {
              dispatch(setInlineErrorMessage(undefined));
            }}
          >
            Hide
          </span>
        </div>
      </div>
    );
  }

  // Handle stream-error type
  if (
    typeof inlineErrorMessage === "object" &&
    inlineErrorMessage !== null &&
    inlineErrorMessage.type === "stream-error"
  ) {
    // Truncate error message to 100 characters for inline display
    const truncatedError =
      inlineErrorMessage.parsedError.length > 100
        ? inlineErrorMessage.parsedError.slice(0, 100) + "..."
        : inlineErrorMessage.parsedError;

    return (
      <div
        className={`border-border relative m-2 flex flex-col rounded-md border border-solid bg-transparent p-4`}
      >
        <p className={`thread-message text-error text-center text-sm`}>
          {`Error: ${truncatedError}`}
        </p>
        <div className="text-description flex flex-row items-center justify-center gap-1.5 px-3">
          <span
            className="cursor-pointer text-xs hover:underline"
            onClick={() => {
              ideMessenger.post("toggleDevTools", undefined);
            }}
          >
            View error log
          </span>
          |
          <span
            className="cursor-pointer text-xs hover:underline"
            onClick={() => {
              dispatch(setInlineErrorMessage(undefined));
            }}
          >
            Hide
          </span>
        </div>
      </div>
    );
  }

  return null;
}
