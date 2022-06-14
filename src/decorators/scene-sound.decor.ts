import { SoundType } from "../export-enums";

export function SceneSound(
  { src, volumn = 1 }: { src: string; volumn?: number },
  type: SoundType = SoundType.ONCE
) {
  return function (target: any, propertyKey: string) {
    target.constructor.soundsDecor.push({
      volumn,
      propertyKey,
      src,
      type,
    });
  };
}
