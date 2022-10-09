import OutOfScopeP5 from "p5";
import { useEffect, useState } from "react";
import { Sound } from "./classes/sound";
import { SoundType } from "./export-enums";
import { Avatar } from "./export-types";

let outOfScopeP5: OutOfScopeP5;

document.addEventListener("DOMContentLoaded", function () {
  const noop = document.createElement("div");
  noop.style.position = "absolute";
  noop.style.zIndex = "-1";
  noop.style.top = "-100%";
  noop.style.left = "-100%";

  document.body.appendChild(noop);
  setTimeout(() => {
    outOfScopeP5 = new OutOfScopeP5((skt) => {}, noop);
  }, 0);
});

export async function createAssetImage(src: string): Promise<Avatar> {
  return new Promise((res: any, rej) => {
    outOfScopeP5.loadImage(src, res, rej);
  });
}

export async function createAssetSound(
  src: string,
  type?: SoundType
): Promise<Sound> {
  const media = new Sound(type);
  return new Promise((res, rej) => {
    // media.native.oncanplaythrough = function () {
    //   res(media);
    // };
    media.native.onloadedmetadata = function () {
      res(media);
    };
    // media.native.onloadeddata = function (e) {
    //   console.log("ee 2", e);
    // };
    media.native.onerror = function (e) {
      if (e instanceof Event) {
        const targetError: any = (e.currentTarget as any).error;
        rej({
          fullSrc: (e.currentTarget as any).src,
          src,
          code: targetError.code,
        });
      } else {
        rej(e);
      }
    };
    // media.native.setAttribute("preload", "metadata");
    // media.native.setAttribute("type", "audio/wav");

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

export async function parallel<T = any, S = T>(
  items: T[],
  each: (t: T, iter: { index: number; realIndex: number }) => Promise<S>,
  limit = 3
): Promise<S[]> {
  const queue = Array.from({ length: Math.ceil(items.length / limit) }).map(
    (_, i) => i
  );

  const results: S[] = [];

  for (const index of queue) {
    const start = index * limit;
    const end = start + limit;
    const _items = items.slice(start, end);
    results.push(
      ...(await Promise.all(
        _items.map((item, i) => each(item, { index: i, realIndex: start + i }))
      ))
    );
  }
  return results;
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    function onResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}

export function toText(obj: Record<string, any> | Record<string, any>[]) {
  const arr = Array.isArray(obj) ? obj : [obj];
  try {
    return `[${arr
      .map((o) =>
        o && typeof o === "object"
          ? `{${Object.keys(o)
              .map((k) => `${k}: ${o[k]}`)
              .join(", ")}}`
          : o
      )
      .join(", ")}]`;
  } catch (error) {
    return obj;
  }
}

const ENGINE_CLASS_PREFIX = "spt-hc_rsgn_";

export function getClassName(cls: string) {
  return ENGINE_CLASS_PREFIX + cls;
}

export function genId(length = 12) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
