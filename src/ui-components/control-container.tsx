import { ReactElement, useMemo } from "react";

type ControlContainerProps = {
  full?: boolean;
  children: ReactElement | ReactElement[];
};

export function ControlContainer({ full, children }: ControlContainerProps) {
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
      style={{
        width: "100%",
        height: full ? "100%" : undefined,
        position: "relative",
      }}
    >
      {_children}
    </div>
  );
}
