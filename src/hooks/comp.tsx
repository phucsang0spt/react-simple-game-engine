import { ReactNode, useCallback, useContext } from "react";
import { ScalerContext } from "../react-context";
import { ScalerContainer } from "../ui-components/scaler-container";

export function useScaleContainer() {
  const scaler = useContext(ScalerContext);

  const _ScalerContainer = useCallback(
    ({ children }: { children: ReactNode }) => {
      return (
        <ScalerContainer
          value={scaler.value}
          width={scaler.canvasSize.width}
          height={scaler.canvasSize.height}
        >
          {children}
        </ScalerContainer>
      );
    },
    [scaler]
  );

  return _ScalerContainer;
}
