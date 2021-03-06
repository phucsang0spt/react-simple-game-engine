export function SpriteFrom(srcable?: string | { src?: string }) {
  return function (target: any, propertyKey: string) {
    const { src } = srcable
      ? typeof srcable === "string"
        ? { src: srcable }
        : srcable
      : { src: undefined };

    target.constructor.spritesDecor.push({
      propertyKey,
      src,
    });
  };
}
