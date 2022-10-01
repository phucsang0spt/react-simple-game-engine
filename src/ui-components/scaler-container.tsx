import { ReactNode } from "react";
import { getClassname } from "../utils";

type ScalerContainerProps = {
  width: number;
  height: number;
  value: number;
  children: ReactNode;
};

export function ScalerContainer({
  width,
  height,
  value,
  children,
}: ScalerContainerProps) {
  return (
    <div className={getClassname("scaler-container")}>
      <div
        style={{
          width,
          height,
          transform: `scale(${value}) translate(-50%, -50%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
