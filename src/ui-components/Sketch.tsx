import { useEffect, useRef } from "react";

import { Camera } from "../classes/camera";
import { P5 } from "../classes/p5";

type SketchProps = {
  onSetup: (camera: Camera) => void;
  onDraw: () => void;
  onPreload?: () => void;
  width: number;
  height: number;
};

export function Sketch({
  onSetup,
  onDraw,
  onPreload,
  width,
  height,
}: SketchProps) {
  const refContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sketch = (s: P5) => {
      const camera = new Camera(width, height);
      s.preload = () => {
        return onPreload?.();
      };

      s.setup = () => {
        s.createCanvas(width, height).parent(refContainer.current!);
        onSetup(camera);
      };

      s.draw = () => {
        s.scale(camera.scaleX, camera.scaleY);
        s.background(0);
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

  return <div style={{ backgroundColor: "#000" }} ref={refContainer} />;
}
