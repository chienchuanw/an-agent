import type { PromptLog, ToolCallState } from "core";

interface GroupTokenUsageDisplayProps {
  toolCallStates: ToolCallState[];
  promptLogs?: PromptLog[];
}

/**
 * 顯示一批 tool calls 的累計 token 使用量
 * 用於在 "Performed X actions" 標題旁邊顯示該批次所有 actions 的累計 token 使用量
 */
export default function GroupTokenUsageDisplay({
  toolCallStates,
  promptLogs,
}: GroupTokenUsageDisplayProps) {
  // Debug logging
  console.log("[GroupTokenUsageDisplay] toolCallStates:", toolCallStates);
  console.log("[GroupTokenUsageDisplay] promptLogs:", promptLogs);

  // 如果沒有 promptLogs，不渲染
  if (!promptLogs || promptLogs.length === 0) {
    console.log("[GroupTokenUsageDisplay] No promptLogs, returning null");
    return null;
  }

  // 收集所有 toolCallIds
  const toolCallIds = new Set(toolCallStates.map((state) => state.toolCallId));
  console.log("[GroupTokenUsageDisplay] toolCallIds:", Array.from(toolCallIds));

  // 過濾出屬於這批 tool calls 的所有 promptLogs
  const groupPromptLogs = promptLogs.filter(
    (log) => log.actionId && toolCallIds.has(log.actionId),
  );
  console.log("[GroupTokenUsageDisplay] groupPromptLogs:", groupPromptLogs);

  // 如果沒有匹配的 promptLogs，不渲染
  if (groupPromptLogs.length === 0) {
    return null;
  }

  // 計算累計 token 使用量
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalCachedTokens = 0;
  let totalReasoningTokens = 0;

  groupPromptLogs.forEach((log) => {
    if (log.usage) {
      totalPromptTokens += log.usage.promptTokens || 0;
      totalCompletionTokens += log.usage.completionTokens || 0;
      totalCachedTokens += log.usage.promptTokensDetails?.cachedTokens || 0;
      totalReasoningTokens +=
        log.usage.completionTokensDetails?.reasoningTokens || 0;
    }
  });

  // 如果沒有任何 token 使用量，不渲染
  if (
    totalPromptTokens === 0 &&
    totalCompletionTokens === 0 &&
    totalCachedTokens === 0 &&
    totalReasoningTokens === 0
  ) {
    return null;
  }

  // 格式化數字，加入千位分隔符
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <span className="ml-2 text-xs text-gray-400">
      ({/* 輸入 tokens */}
      <span className="inline-flex items-center space-x-0.5">
        <span className="text-red-400">↑</span>
        <span>{formatNumber(totalPromptTokens)}</span>
      </span>
      {/* 輸出 tokens */}
      <span className="ml-2 inline-flex items-center space-x-0.5">
        <span className="text-green-400">↓</span>
        <span>{formatNumber(totalCompletionTokens)}</span>
      </span>
      {/* Cache tokens (如果有) */}
      {totalCachedTokens > 0 && (
        <span className="ml-2 inline-flex items-center space-x-0.5">
          <span className="text-orange-400">⚡</span>
          <span>{formatNumber(totalCachedTokens)}</span>
        </span>
      )}
      {/* Reasoning tokens (如果有) */}
      {totalReasoningTokens > 0 && (
        <span className="ml-2 inline-flex items-center space-x-0.5">
          <span className="text-purple-400">🧠</span>
          <span>{formatNumber(totalReasoningTokens)}</span>
        </span>
      )}
      )
    </span>
  );
}
