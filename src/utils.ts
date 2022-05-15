import OutofScopeP5 from "p5";
import { Avatar, Sound } from "./export-types";

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

export async function createAssetSound(src: string): Promise<Sound> {
  const media = new Audio();
  return new Promise((res, rej) => {
    media.onloadedmetadata = function () {
      res(media);
    };
    media.onerror = function (error) {
      rej(error);
    };
    media.src = src;
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
