import { ToolPolicy } from "@continuedev/terminal-security";
import { Tool, ToolCallState } from "core";
import { IIdeMessenger } from "../../context/IdeMessenger";
import { isDangerousCommand } from "../../util/dangerousCommands";
import { isEditTool } from "../../util/toolCallState";
import { errorToolCall, updateToolCallOutput } from "../slices/sessionSlice";
import { DEFAULT_TOOL_SETTING, ToolPolicies } from "../slices/uiSlice";
import { AppThunkDispatch } from "../store";

interface EvaluatedPolicy {
  policy: ToolPolicy;
  displayValue?: string;
  toolCallState: ToolCallState;
}

/**
 * Evaluates the tool policy for a tool call, including dynamic policy evaluation
 * Note that tool group policies are not considered here because activeTools already excludes disabled groups
 *
 * @param ideMessenger - IDE messenger for communication with core
 * @param activeTools - List of active tools
 * @param toolCallState - The tool call state to evaluate
 * @param toolPolicies - User-defined tool policies
 * @param isAutoMode - Whether Auto Mode is enabled
 * @returns Evaluated policy result
 */
async function evaluateToolPolicy(
  ideMessenger: IIdeMessenger,
  activeTools: Tool[],
  toolCallState: ToolCallState,
  toolPolicies: ToolPolicies,
  isAutoMode: boolean,
): Promise<EvaluatedPolicy> {
  // allow edit tool calls without permission
  if (isEditTool(toolCallState.toolCall.function.name)) {
    return { policy: "allowedWithoutPermission", toolCallState };
  }

  const basePolicy =
    toolPolicies[toolCallState.toolCall.function.name] ??
    activeTools.find(
      (tool) => tool.function.name === toolCallState.toolCall.function.name,
    )?.defaultToolPolicy ??
    DEFAULT_TOOL_SETTING;

  const toolName = toolCallState.toolCall.function.name;
  const result = await ideMessenger.request("tools/evaluatePolicy", {
    toolName,
    basePolicy,
    parsedArgs: toolCallState.parsedArgs,
    processedArgs: toolCallState.processedArgs,
  });

  // Evaluate the policy dynamically
  if (result.status === "error") {
    console.error(`Error evaluating tool policy for ${toolName}`, result.error);
    return { policy: "disabled", toolCallState };
  }

  let dynamicPolicy = result.content.policy;
  const displayValue = result.content.displayValue;

  // Ensure dynamic policy cannot be more lenient than base policy
  // Policy hierarchy (most restrictive to least): disabled > allowedWithPermission > allowedWithoutPermission
  if (basePolicy === "disabled") {
    return { policy: "disabled", displayValue, toolCallState }; // Cannot override disabled
  }

  // Auto Mode logic: convert allowedWithPermission to allowedWithoutPermission
  // EXCEPT for dangerous commands which still require confirmation
  if (isAutoMode && dynamicPolicy === "allowedWithPermission") {
    // Check if this is a dangerous Bash command
    if (
      toolName === "runTerminalCommand" &&
      toolCallState.parsedArgs?.command
    ) {
      const command = String(toolCallState.parsedArgs.command);
      if (isDangerousCommand(command)) {
        // Dangerous commands still require confirmation even in Auto Mode
        return { policy: "allowedWithPermission", displayValue, toolCallState };
      }
    }

    // Non-dangerous tools in Auto Mode: auto-approve
    dynamicPolicy = "allowedWithoutPermission";
  }

  // After Auto Mode processing, ensure dynamic policy cannot be more lenient than base policy
  // (unless Auto Mode explicitly allowed it)
  if (
    !isAutoMode &&
    basePolicy === "allowedWithPermission" &&
    dynamicPolicy === "allowedWithoutPermission"
  ) {
    return { policy: "allowedWithPermission", displayValue, toolCallState }; // Cannot make more lenient
  }

  return { policy: dynamicPolicy, displayValue, toolCallState };
}

/*
    1. Get arg-dependent tool policies from core
    2. Mark any disabled ones as errored
    3. Mark others as generated
*/
export async function evaluateToolPolicies(
  dispatch: AppThunkDispatch,
  ideMessenger: IIdeMessenger,
  activeTools: Tool[],
  generatedToolCalls: ToolCallState[],
  toolPolicies: ToolPolicies,
  isAutoMode: boolean,
): Promise<EvaluatedPolicy[]> {
  // Check if ALL tool calls are auto-approved using dynamic evaluation
  const policyResults = await Promise.all(
    generatedToolCalls.map((toolCallState) =>
      evaluateToolPolicy(
        ideMessenger,
        activeTools,
        toolCallState,
        toolPolicies,
        isAutoMode,
      ),
    ),
  );

  const disabledResults = policyResults.filter(
    ({ policy }) => policy === "disabled",
  );

  for (const { displayValue, toolCallState } of disabledResults) {
    dispatch(errorToolCall({ toolCallId: toolCallState.toolCallId }));

    // Use the displayValue from the policy evaluation, or fallback to function name
    const command = displayValue || toolCallState.toolCall.function.name;

    // Add error message explaining why it's disabled
    dispatch(
      updateToolCallOutput({
        toolCallId: toolCallState.toolCallId,
        contextItems: [
          {
            icon: "problems",
            name: "Security Policy Violation",
            description: "Command Disabled",
            content: `This command has been disabled by security policy:\n\n${command}\n\nThis command cannot be executed as it may pose a security risk.`,
            hidden: false,
          },
        ],
      }),
    );
  }

  return policyResults;
}
