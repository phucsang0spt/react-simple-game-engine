export interface Initialler<P = any> {
  initial: (params: P) => void;
}
