type Typed =
  | never
  | undefined
  | BooleanConstructor
  | StringConstructor
  | NumberConstructor
  | Record<string, any>
  | Record<string, any>[];

type ValueType<
  V extends any = undefined,
  T extends Typed = Typed
> = V extends undefined
  ? T extends BooleanConstructor
    ? boolean
    : T extends StringConstructor
    ? string
    : T extends NumberConstructor
    ? number
    : V
  : V;

class _Saver {
  static STORAGE_PREFIX = "rsgn::";
  private store = window.localStorage;

  constructor() {
    this.store
      ? console.log("Initial saver success")
      : console.log("Initial saver fail");
  }

  set<V extends any = any>(key: string, value: V): void {
    this.store.setItem(`${_Saver.STORAGE_PREFIX}${key}`, JSON.stringify(value));
  }

  get<V extends any = undefined, T extends Typed = Typed>(
    key: string,
    type?: T
  ): ValueType<V, T> {
    const raw = this.store.getItem(`${_Saver.STORAGE_PREFIX}${key}`);

    const parsed = (raw == null ? raw : JSON.parse(raw)) as any;
    if (type === Boolean) {
      if (raw == null) {
        return undefined;
      }

      return (parsed === "0" || parsed === "false" || !parsed
        ? false
        : true) as boolean as any;
    }
    if (type === Number) {
      return (parsed == null || isNaN(parsed)
        ? parsed
        : +parsed) as number as any;
    }
    if (type === String) {
      return (parsed == null || typeof type === "string"
        ? parsed
        : parsed.toString()) as string as any;
    }
    return parsed;
  }

  getWithDefault<V extends any = undefined, T extends Typed = Typed>(
    key: string,
    defaultValue: any,
    type?: T
  ): ValueType<V, T> {
    const value = this.get(key, type);

    return value ?? defaultValue;
  }
}

export const Saver = new _Saver();
