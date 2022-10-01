import { CSSProperties, ReactNode } from "react";
import { getClassname } from "../utils";

type FloatContainerProps = {
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
};

export function FloatContainer({ children, style, id }: FloatContainerProps) {
  return (
    <div className={getClassname("float-container")} style={style}>
      <div id={id}>{children}</div>
    </div>
  );
}
