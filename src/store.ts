import { writable } from "svelte/store";

export const srcCode = writable<string>();
export const saveTrigger = writable<boolean>();
export const unsavedChangeTrigger = writable<boolean>();
export const fileDoesExist = writable<boolean>();
export const fileName = writable<string>();
export const output = writable<string[]>();
