import OutofScopeP5 from "p5";
import { Sound } from "./classes/sound";
import { SoundType } from "./export-enums";
import { Avatar } from "./export-types";

let outofScopeP5!: OutofScopeP5;

document.addEventListener("DOMContentLoaded", function () {
  const noop = document.createElement("div");
  noop.style.position = "absolute";
  noop.style.zIndex = "-1";
  noop.style.top = "-100%";
  noop.style.left = "-100%";

  document.body.appendChild(noop);
  setTimeout(() => {
    outofScopeP5 = new OutofScopeP5((skt) => {}, noop);
  }, 0);
});

export async function createAssetImage(src: string): Promise<Avatar> {
  return new Promise((res: any, rej) => {
    outofScopeP5.loadImage(src, res, rej);
  });
}

export async function createAssetSound(
  src: string,
  type?: SoundType
): Promise<Sound> {
  const media = new Sound(type);
  return new Promise((res, rej) => {
    media.native.onloadedmetadata = function () {
      res(media);
    };
    media.native.onerror = function (error) {
      rej(error);
    };
    media.native.src = src;
  });
}

export async function tick(delay?: number) {
  return new Promise((res) => {
    if (delay != null) {
      setTimeout(res, delay);
    } else {
      // wait forever
    }
  });
}

export function copyProperties(
  source: Record<string, any>,
  target: Record<string, any>
) {
  for (const key in target) {
    if (target[key] !== undefined) {
      source[key] = target[key];
    }
  }
}
