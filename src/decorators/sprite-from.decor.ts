export function SpriteFrom(source?: string | { src?: string }) {
  return function (target: any, propertyKey: string) {
    const { src } = source
      ? typeof source === "string"
        ? { src: source }
        : source
      : { src: undefined };

    if (!target.spritesDecor) {
      target.spritesDecor = [];
    }
    target.spritesDecor.push({
      propertyKey,
      src,
    });
  };
}
