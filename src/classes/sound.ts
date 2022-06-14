import { SoundType } from "../export-enums";
import { SoundManagement } from "../export-types";

// cant not Sound extends Audio, because TS complite, make call new Audio like a function
export class Sound {
  static Management: SoundManagement = {
    [SoundType.ONCE]: {
      canPlay: true,
      loop: false,
    },
    [SoundType.BACKGROUND]: {
      canPlay: true,
      loop: true,
    },
  };
  readonly native: HTMLAudioElement = new Audio();

  constructor(private readonly type: SoundType = SoundType.ONCE) {}

  get volumn() {
    return this.native.volume;
  }

  set volumn(vol: number) {
    this.native.volume = vol;
  }

  async playNow() {
    const { canPlay } = Sound.Management[this.type];
    if (canPlay) {
      this.native.currentTime = 0;
      await this.play();
    }
  }

  async stop() {
    this.native.pause();
    this.native.currentTime = 0;
    this.native.src = "";
  }

  async play() {
    const { canPlay, loop } = Sound.Management[this.type];
    if (canPlay) {
      if (loop) {
        this.native.loop = true;
      } else {
        this.native.loop = false;
      }
      await this.native.play();
    }
  }
}
