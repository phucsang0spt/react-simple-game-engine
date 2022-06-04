import { SoundType } from "../export-enums";
import { SoundManagement } from "../export-types";

// cant not Sound extends Audio, because TS complite, make call new Audio like a function
export class Sound {
  static Management: SoundManagement = {
    [SoundType.ONCE]: {
      canPlay: true,
    },
    [SoundType.BACKGROUND]: {
      canPlay: true,
    },
  };
  readonly native: HTMLAudioElement = new Audio();

  constructor(private readonly type: SoundType = SoundType.ONCE) {}

  async playNow() {
    const { canPlay } = Sound.Management[this.type];
    if (canPlay) {
      this.native.currentTime = 0;
      await this.play();
    }
  }

  async play() {
    const { canPlay } = Sound.Management[this.type];
    if (canPlay) {
      await this.native.play();
    }
  }
}
