declare interface Window {
  Renderer: import("./classes/p5").P5 & {
    scaler: import("./classes/scaler").Scaler;
  };
}

declare var Renderer: Window["Renderer"];

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
