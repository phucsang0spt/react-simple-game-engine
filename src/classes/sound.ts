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

  constructor(public readonly type: SoundType = SoundType.ONCE) {}

  get volume() {
    return this.native.volume;
  }

  set volume(vol: number) {
    this.native.volume = vol;
  }

  get isStopped() {
    return this.native.paused && this.native.currentTime === 0;
  }

  async playNow() {
    const { canPlay } = Sound.Management[this.type];
    if (canPlay) {
      this.native.currentTime = 0;
      await this.play();
    }
  }

  async pause() {
    await this.native.pause();
  }

  async resume() {
    if (!this.isStopped) {
      if (this.native.paused) {
        await this.play();
      }
    }
  }

  async stop() {
    if (!this.isStopped) {
      this.native.pause();
      this.native.currentTime = 0;
      this.native.loop = false;
    }
  }

  async play() {
    const { canPlay } = Sound.Management[this.type];
    if (canPlay) {
      const loop = this.type === SoundType.BACKGROUND;
      if (loop) {
        this.native.loop = true;
      } else {
        this.native.loop = false;
      }
      await this.native.play();
    }
  }
}
