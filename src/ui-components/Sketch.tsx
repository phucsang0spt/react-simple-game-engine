import { useEffect, useRef } from "react";

import { P5 } from "../classes/p5";
import { Scaler } from "../classes/scaler";
import { SimpleCamera } from "../classes/simple-camera";

type SketchProps = {
  onSetup: (simpleCamera: SimpleCamera) => void;
  onDraw: () => void;
  onMouseMove: () => void;
  onMousePressed: () => void;
  onMouseRelease: () => void;
  onPreload?: () => void;
  scaler: Scaler;
};

export function Sketch({
  onSetup,
  onDraw,
  onMouseMove,
  onMousePressed,
  onMouseRelease,
  onPreload,
  scaler,
}: SketchProps) {
  const refContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sketch = (s: P5) => {
      const camera = new SimpleCamera();
      s.simpleCamera = camera;
      s.preload = () => {
        window.Renderer = s;
        window.Renderer.scaler = scaler;
        return onPreload?.();
      };

      s.setup = () => {
        s.createCanvas(
          scaler.canvasSize.width,
          scaler.canvasSize.height
        ).parent(refContainer.current!);
        onSetup(camera);
      };

      s.mouseMoved = onMouseMove;
      s.mousePressed = onMousePressed;
      s.mouseReleased = onMouseRelease;

      s.draw = () => {
        s.imageMode(s.CENTER);
        s.rectMode(s.CENTER);
        onDraw();
      };
    };

    const p5 = new P5(sketch);
    return () => {
      p5.remove();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      style={{
        height: scaler.canvasSize.height,
        width: scaler.canvasSize.width,
      }}
      ref={refContainer}
    />
  );
}
