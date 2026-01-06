import type { PromptLog } from "core";

interface ActionTokenUsageDisplayProps {
  actionId: string;
  promptLogs?: PromptLog[];
}

/**
 * 顯示指定 actionId 的累計 token 使用量（灰白色樣式）
 * 用於在每個 tool call action 完成後顯示該 action 的 token 使用量
 */
export default function ActionTokenUsageDisplay({
  actionId,
  promptLogs,
}: ActionTokenUsageDisplayProps) {
  // 如果沒有 promptLogs，不渲染
  if (!promptLogs || promptLogs.length === 0) {
    return null;
  }

  // 過濾出屬於該 actionId 的所有 promptLogs
  const actionPromptLogs = promptLogs.filter(
    (log) => log.actionId === actionId,
  );

  // 如果沒有匹配的 promptLogs，不渲染
  if (actionPromptLogs.length === 0) {
    return null;
  }

  // 計算累計 token 使用量
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalCachedTokens = 0;
  let totalReasoningTokens = 0;

  actionPromptLogs.forEach((log) => {
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
    <div className="flex items-center space-x-2 text-xs text-gray-400">
      {/* 輸入 tokens */}
      <span className="flex items-center space-x-0.5">
        <span>↑</span>
        <span>{formatNumber(totalPromptTokens)}</span>
      </span>

      {/* 輸出 tokens */}
      <span className="flex items-center space-x-0.5">
        <span>↓</span>
        <span>{formatNumber(totalCompletionTokens)}</span>
      </span>

      {/* Cache tokens (如果有) */}
      {totalCachedTokens > 0 && (
        <span className="flex items-center space-x-0.5">
          <span>⚡</span>
          <span>{formatNumber(totalCachedTokens)}</span>
        </span>
      )}

      {/* Reasoning tokens (如果有) */}
      {totalReasoningTokens > 0 && (
        <span className="flex items-center space-x-0.5">
          <span>🧠</span>
          <span>{formatNumber(totalReasoningTokens)}</span>
        </span>
      )}
    </div>
  );
}
