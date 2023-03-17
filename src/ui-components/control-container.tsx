import { ReactElement, useMemo } from "react";
import { getClassName } from "../utils";

type ControlContainerProps = {
  full?: boolean;
  children: ReactElement | ReactElement[];
  stack?: boolean;
};

export function ControlContainer({
  stack = false,
  full,
  children,
}: ControlContainerProps) {
  const _children = useMemo(() => {
    const _children = Array.isArray(children) ? children : [children];
    return _children
      .reduce((arr: any[], child) => {
        arr.push(...(Array.isArray(child) ? child : [child]));
        return arr;
      }, [])
      .filter(Boolean);
  }, [children]);

  return (
    <div
      className={getClassName("control-container")}
      data-stack={stack}
      style={{
        height: full ? "100%" : undefined,
      }}
    >
      {_children}
    </div>
  );
}
