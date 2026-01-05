import React from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setAutoMode } from "../../../redux/slices/sessionSlice";
import { ToolTip } from "../../gui/Tooltip";

/**
 * Auto Mode 切換開關組件
 *
 * 此組件僅在 Agent 模式下顯示，允許使用者切換 Auto Mode。
 * 當 Auto Mode 啟用時，大部分工具會自動執行而不需要使用者確認，
 * 但危險指令（如 rm -rf, sudo 等）仍會要求確認。
 */
const AutoModeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAutoMode = useAppSelector((state) => state.session.isAutoMode);
  const mode = useAppSelector((state) => state.session.mode);

  // 僅在 Agent 模式下顯示
  if (mode !== "agent") {
    return null;
  }

  const handleToggle = () => {
    dispatch(setAutoMode(!isAutoMode));
  };

  return (
    <ToolTip
      content="Auto Mode: Allow agent to execute tools automatically"
      place="top"
    >
      <div
        data-testid="auto-mode-toggle"
        role="switch"
        aria-checked={isAutoMode}
        aria-label="Toggle Auto Mode"
        onClick={handleToggle}
        className={`flex cursor-pointer select-none items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors ${
          isAutoMode
            ? "bg-vsc-button-background text-vsc-button-foreground"
            : "text-description hover:bg-badge"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${isAutoMode ? "bg-green-400" : "bg-gray-500"}`}
        />
        <span>Auto</span>
      </div>
    </ToolTip>
  );
};

export default AutoModeToggle;
