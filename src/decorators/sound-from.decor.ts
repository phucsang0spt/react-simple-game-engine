import { SoundType } from "../export-enums";

export function SoundFrom(
  srcable?: string | { src?: string; volumn?: number },
  type: SoundType = SoundType.ONCE
) {
  return function (target: any, propertyKey: string) {
    const { volumn, src } = srcable
      ? typeof srcable === "string"
        ? { src: srcable, volumn: undefined }
        : srcable
      : { volumn: undefined, src: undefined };

    target.constructor.soundsDecor.push({
      volumn,
      propertyKey,
      src,
      type,
    });
  };
}
