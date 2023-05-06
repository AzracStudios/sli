import { get } from "svelte/store";
import { output } from "../store";

export function runCode(src: string) {
  output.set([...(get(output) || []), ...src.split("\n")]);
}
