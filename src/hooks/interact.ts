import { useEffect, useMemo, useRef } from "react";

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

  return useMemo(() => {
    const callOnPress: { func?: () => void } = {
      func: undefined,
    };
    return {
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
  }, [delay, onPress]);
}
