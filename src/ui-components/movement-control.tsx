import {
  CSSProperties,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { JoystickActionType, JoystickDirection } from "../export-enums";
import { UISceneContext } from "../react-context";
import { Watcher } from "../utilities";
import { Joystick } from "./react-joystick-component";
import {
  IJoystickProps,
  IJoystickUpdateEvent,
} from "./react-joystick-component/Joystick";

export type TouchEvent = {
  onPressed?: (container: HTMLDivElement, stick: HTMLButtonElement) => void;
  onReleased?: (container: HTMLDivElement, stick: HTMLButtonElement) => void;
};
export type MovementControlProps = {
  onLoaded?: (container: HTMLDivElement, stick: HTMLButtonElement) => void;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  render?: (el: ReactElement) => ReactNode;
  containerTouchEvent?: TouchEvent;
  props?: Omit<IJoystickProps, "start" | "move" | "stop">;
};

export function MovementControl({
  render,
  top,
  left = 50,
  right,
  bottom = 50,
  props,
  containerTouchEvent,
  onLoaded,
}: MovementControlProps) {
  const refJoyWrap = useRef<HTMLDivElement>(null);
  const refStick = useRef<HTMLButtonElement>(null);
  const scene = useContext(UISceneContext);
  const { joystick: joystickConfigs } = useMemo(() => {
    return scene.getInitialConfigs();
  }, [scene]);

  useEffect(() => {
    if (!refJoyWrap.current) {
      return;
    }
    refStick.current = refJoyWrap.current.querySelectorAll("button")[0];
    onLoaded?.(refJoyWrap.current, refStick.current);
  }, [onLoaded]);

  const el = useMemo(() => {
    const onAction = (e: IJoystickUpdateEvent) => {
      if (e.type === JoystickActionType.MOVE) {
        scene.emitJoystickActionEvent({
          type: e.type as JoystickActionType.MOVE,
          vector: Renderer.createVector(e.x, -e.y).normalize(), // -y reverse direction
          weight: e.distance / 100, // 0 -> 1
          length: e.distance, // 0 -> 100
          direction: e.direction as JoystickDirection,
        });
      } else {
        scene.emitJoystickActionEvent({
          type: e.type as JoystickActionType.START | JoystickActionType.STOP,
        });
      }
    };

    const joystick = (
      <Joystick
        size={60}
        baseColor="#2D2D2D"
        stickColor="rgb(120,121,122)"
        throttle={100}
        {...props}
        start={onAction}
        move={onAction}
        stop={onAction}
      />
    );

    let isReleased = false;

    const handleTouchDown = () => {
      isReleased = false;
      containerTouchEvent?.onPressed?.(refJoyWrap.current, refStick.current);
      (joystickConfigs as any)?.containerTouchEvent?.onPressed?.(
        refJoyWrap.current,
        refStick.current
      );
    };

    const handleTouchUp = () => {
      if (isReleased) {
        return;
      }
      isReleased = true;
      containerTouchEvent?.onReleased?.(refJoyWrap.current, refStick.current);
      (joystickConfigs as any)?.containerTouchEvent?.onReleased?.(
        refJoyWrap.current,
        refStick.current
      );
    };
    return (
      <div
        ref={refJoyWrap}
        onPointerDown={(event: any) => {
          event.target.setPointerCapture(event.pointerId);
          handleTouchDown();
        }}
        onPointerUp={(event: any) => {
          event.target.releasePointerCapture(event.pointerId);
          handleTouchUp();
        }}
        onMouseLeave={handleTouchUp}
        style={
          {
            position: "absolute",
            left: right != null ? undefined : left,
            right,
            bottom: top != null ? undefined : bottom,
            top,
          } as CSSProperties
        }
      >
        {render ? render(joystick) : joystick}
      </div>
    );
  }, [props, containerTouchEvent]);

  return (
    <Watcher
      initialValues={{
        isShow: !!joystickConfigs,
      }}
      names="control-visible"
    >
      {({ isShow }) => (isShow ? el : null)}
    </Watcher>
  );
}
