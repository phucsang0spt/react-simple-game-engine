import { ReactElement, ReactNode, useContext, useMemo } from "react";

import { Scene } from "../classes/scene";
import { JoystickActionType, JoystickDirection } from "../export-enums";
import { UISceneContext } from "../react-context";
import { Watcher } from "../utilities";
import { Joystick } from "./react-joystick-component";
import {
  IJoystickProps,
  IJoystickUpdateEvent,
} from "./react-joystick-component/Joystick";

export type MovementControlProps = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  render?: (el: ReactElement) => ReactNode;
  props?: Omit<IJoystickProps, "start" | "move" | "stop">;
};

export function MovementControl({
  render,
  top,
  left = 50,
  right,
  bottom = 50,
  props,
}: MovementControlProps) {
  const scene = useContext(UISceneContext);
  const { joystick: defaultShow } = useMemo(() => {
    return scene.getInitialData();
  }, [scene]);

  const el = useMemo(() => {
    const onAction = (e: IJoystickUpdateEvent) => {
      if (e.type === JoystickActionType.MOVE) {
        scene.emitJoystickAction({
          type: e.type as JoystickActionType.MOVE,
          vector: Renderer.createVector(e.x, -e.y).normalize(), // -y reverse direction
          weight: e.distance / 100, // 0 -> 1
          length: e.distance, // 0 -> 100
          direction: e.direction as JoystickDirection,
        });
      } else {
        scene.emitJoystickAction({
          type: e.type as JoystickActionType.START | JoystickActionType.STOP,
        });
      }
    };
    return (
      <div
        style={{
          position: "absolute",
          left: right != null ? undefined : left,
          right,
          bottom: top != null ? undefined : bottom,
          top,
        }}
      >
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
      </div>
    );
  }, [props]);

  return (
    <Watcher
      initialValues={{
        isShow: defaultShow,
      }}
      names="control-visible"
    >
      {({ isShow }) => (isShow ? (render ? render(el) : el) : null)}
    </Watcher>
  );
}
