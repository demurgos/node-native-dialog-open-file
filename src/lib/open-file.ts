import * as native from "../native/index";

export interface OpenFileOptions {
  defaultDir?: string;
}

export function openFileSync(options?: OpenFileOptions): string | null {
  return native.openFileSync();
}
