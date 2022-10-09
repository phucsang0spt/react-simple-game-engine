import { CSSProperties, ReactNode } from "react";
import { getClassName } from "../utils";

type FloatContainerProps = {
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
};

export function FloatContainer({ children, style, id }: FloatContainerProps) {
  return (
    <div className={getClassName("float-container")} style={style}>
      <div id={id}>{children}</div>
    </div>
  );
}
