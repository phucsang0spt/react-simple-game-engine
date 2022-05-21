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
      window.Renderer = s;
      let camera: Camera;

      s.preload = () => {
        return onPreload?.();
      };

      s.setup = () => {
        camera = new Camera(width, height);
        s.createCanvas(width, height).parent(refContainer.current!);
        onSetup(camera);

        //@ts-ignore
        window.camera = camera;
      };

      s.draw = () => {
        s.scale(camera.scaleX, camera.scaleY);
        s.background(0);
        s.imageMode(s.CENTER);
        s.rectMode(s.CENTER);
        onDraw();
        // if (s.keyIsDown(s.DOWN_ARROW)) {
        //   camera.y += 2;
        // }
        // if (s.keyIsDown(s.UP_ARROW)) {
        //   camera.y -= 2;
        // }

        // if (s.keyIsDown(s.LEFT_ARROW)) {
        //   camera.x -= 2;
        // }
        // if (s.keyIsDown(s.RIGHT_ARROW)) {
        //   camera.x += 2;
        // }
      };
    };

    new P5(sketch);
    // eslint-disable-next-line
  }, []);

  return <div style={{ backgroundColor: "#000" }} ref={refContainer} />;
}
