export interface Initializer<P = any> {
  initial: (params: P) => void;
}
