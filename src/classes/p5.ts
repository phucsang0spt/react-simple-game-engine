import p5 from "p5";
import { Point } from "../export-types";
import { Scaler } from "./scaler";
import { SimpleCamera } from "./simple-camera";

type ItemWithPercent<I> = [I, number];
type LastItem<I> = [I];

export type Collection<I> = [...ItemWithPercent<I>[], LastItem<I>];

export class P5 extends p5 {
  running = true;
  scaler: Scaler;
  simpleCamera: SimpleCamera;

  constructor(sketch: (p5: P5) => void) {
    super(sketch);
  }

  /**
   * Use this instead of mouseX
   * @number
   */
  get realMouseX() {
    return (
      this.mouseX / this.scaler.value - this.width / 2 + this.simpleCamera.x
    );
  }

  /**
   * Use this instead of mouseY
   * @number
   */
  get realMouseY() {
    return (
      this.mouseY / this.scaler.value - this.height / 2 + this.simpleCamera.y
    );
  }

  get isForeground() {
    return window.document.visibilityState === "visible";
  }

  drawHandle(position: Point, onDraw: (p5: P5) => void) {
    const camera = this.simpleCamera;
    this.push();

    this.translate(
      this.width / 2 + position.x - camera.x,
      this.height / 2 + position.y - camera.y
    );
    this.noStroke();
    onDraw(this);
    this.pop();
  }

  constrainMax(value: number, max: number) {
    if (value > max) {
      return max;
    } else {
      return value;
    }
  }

  constrainMin(value: number, min: number) {
    if (value < min) {
      return min;
    } else {
      return value;
    }
  }

  choose<I = any>(collection: Collection<I>): I {
    const lastItem = collection[collection.length - 1];
    const restItems = collection.slice(0, collection.length - 1);

    let totalPercentsOfRestItems = (restItems as ItemWithPercent<I>[]).reduce(
      (t, item) => {
        return t + item[1];
      },
      0
    );
    if (totalPercentsOfRestItems > 1) {
      const overMax = totalPercentsOfRestItems - 1;
      const avg = 1 / restItems.length;
      for (const item of restItems) {
        if (item[1]! > avg) {
          item[1]! -= overMax;
        }
      }
      totalPercentsOfRestItems = 1;
    }
    lastItem[1] = 1 - totalPercentsOfRestItems;

    const items: I[] = [];
    for (const [item, percent] of collection) {
      Array.from({ length: Math.round(percent! * 10) }).forEach(() => {
        items.push(item);
      });
    }
    this.shuffle(items, true);
    return this.random(items);
  }
}
