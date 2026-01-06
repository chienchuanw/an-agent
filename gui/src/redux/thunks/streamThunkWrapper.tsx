import { createAsyncThunk } from "@reduxjs/toolkit";
import posthog from "posthog-js";
import { analyzeError } from "../../util/errorAnalysis";
import { selectSelectedChatModel } from "../slices/configSlice";
import { setInlineErrorMessage } from "../slices/sessionSlice";
import { ThunkApiType } from "../store";
import { cancelStream } from "./cancelStream";
import { saveCurrentSession } from "./session";

export const streamThunkWrapper = createAsyncThunk<
  void,
  () => Promise<void>,
  ThunkApiType
>("chat/streamWrapper", async (runStream, { dispatch, extra, getState }) => {
  try {
    await runStream();
    const state = getState();
    if (!state.session.isInEdit) {
      await dispatch(
        saveCurrentSession({
          openNewSession: false,
          generateTitle: true,
        }),
      );
    }
  } catch (e) {
    await dispatch(cancelStream());

    // Get the selected model from the state for error analysis
    const state = getState();
    const selectedModel = selectSelectedChatModel(state);

    const { parsedError, statusCode, modelTitle, providerName } = analyzeError(
      e,
      selectedModel,
    );

    // Set inline error message instead of showing modal dialog
    dispatch(
      setInlineErrorMessage({
        type: "stream-error",
        error: e,
        parsedError,
      }),
    );

    const errorData = {
      error_type: statusCode ? `HTTP ${statusCode}` : "Unknown",
      error_message: parsedError,
      model_provider: providerName,
      model_title: modelTitle,
    };

    posthog.capture("gui_stream_error", errorData);
  }
});
