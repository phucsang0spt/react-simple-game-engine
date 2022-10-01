import { SoundType } from "../export-enums";

export function SoundFrom(
  srcable?: string | { src?: string; volume?: number },
  type: SoundType = SoundType.ONCE
) {
  return function (target: any, propertyKey: string) {
    const { volume, src } = srcable
      ? typeof srcable === "string"
        ? { src: srcable, volume: undefined }
        : srcable
      : { volume: undefined, src: undefined };

    if (!target.soundsDecor) {
      target.soundsDecor = [];
    }
    target.soundsDecor.push({
      volume: volume,
      propertyKey: propertyKey,
      src: src,
      type: type,
    });
  };
}
