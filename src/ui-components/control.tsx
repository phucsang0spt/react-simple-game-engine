import { ReactNode, useMemo } from "react";
import { useLongPress, UseLongPressProps } from "../hooks/interact";
import { getClassName } from "../utils";

export type ControlProps = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  children: ReactNode;
  xAxisOriginCenter?: boolean;
  yAxisOriginCenter?: boolean;
  orientation?: "vertical" | "horizontal";
  alignment?: "flex-start" | "center" | "flex-end";

  interact?: Partial<UseLongPressProps>;
};

export function Control({
  xAxisOriginCenter = false,
  yAxisOriginCenter = false,
  top,
  left,
  right,
  bottom,
  children,
  orientation = "vertical",
  alignment = "flex-start",
  interact = {},
}: ControlProps) {
  const longPressProps = useLongPress(
    interact.onLongPress,
    interact.delay,
    interact.exts
  );
  const transform = useMemo(() => {
    const x = xAxisOriginCenter ? `${left != null ? -50 : 50}%` : 0;
    const y = yAxisOriginCenter ? `${top != null ? -50 : 50}%` : 0;
    return `translate(${x},${y})`;
  }, [left, top, xAxisOriginCenter, yAxisOriginCenter]);

  return (
    <div
      className={getClassName("ui-control")}
      style={{
        top,
        left,
        right,
        bottom,
        flexDirection: orientation === "vertical" ? "column" : "row",
        alignItems: alignment,
        transform,
      }}
      {...longPressProps}
    >
      {children}
    </div>
  );
}
