import { SoundType } from "../export-enums";

export function SoundFrom(
  source?: string | { src?: string; volume?: number },
  type: SoundType = SoundType.ONCE
) {
  return function (target: any, propertyKey: string) {
    const { volume, src } = source
      ? typeof source === "string"
        ? { src: source, volume: undefined }
        : source
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
