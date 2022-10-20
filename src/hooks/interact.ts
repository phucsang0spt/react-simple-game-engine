import { useEffect, useMemo, useRef } from "react";
import { isRealPhone } from "../utils";

export type UseLongPressProps = {
  onLongPress: () => void | undefined;
  delay?: number;
  exts?: {
    onPress?: () => void | undefined;
  };
};

export function useLongPress(
  onLongPress: UseLongPressProps["onLongPress"],
  delay: UseLongPressProps["delay"] = 600,
  exts?: UseLongPressProps["exts"]
) {
  const { onPress } = exts || {};

  const refTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      clearTimeout(refTimer.current);
    };
  }, []);

  const isPhone = useMemo(() => isRealPhone(), []);

  return useMemo(() => {
    const callOnPress: { func?: () => void } = {
      func: undefined,
    };
    const interact = {
      onMouseDown: () => {
        callOnPress.func = onPress;
        refTimer.current = setTimeout(() => {
          delete callOnPress.func;
          onLongPress?.();
        }, delay);
      },
      onMouseUp: () => {
        callOnPress.func?.();
        clearTimeout(refTimer.current);
      },
    };
    if (isPhone) {
      return {
        onTouchStart: interact.onMouseDown,
        onTouchEnd: interact.onMouseUp,
      };
    }
    return interact;
  }, [delay, onPress, isPhone]);
}
