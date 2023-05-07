import { writable } from "svelte/store";

export const tempSrc = writable<string>();
export const cursorPosition = writable<number>();
export const triggerCursorReposition = writable<boolean>();
