import { ReactNode } from "react";
import { getClassName } from "../utils";

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
    <div className={getClassName("scaler-container")}>
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
