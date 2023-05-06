import { get } from "svelte/store";
import { runCode } from "../language/main";
import { srcCode, unsavedChangeTrigger } from "../store";

export const run = () => {
  runCode(get(srcCode));
};

export const confirmDiscardUnsavedChanges = (): boolean => {
  if (get(unsavedChangeTrigger)) {
    if (confirm("There are unsaved changes. Are you sure?")) return true;
    return false;
  }
  return true;
};

export const getFilesFromStorage = (): { string: string } => {
  let existingFiles: string | null = localStorage.getItem("files");

  if (!existingFiles) {
    existingFiles = JSON.stringify({});
    localStorage.setItem("files", existingFiles);
  }

  return JSON.parse(existingFiles);
};

export const saveFileToStorage = (fileToSave: string): boolean => {
  if (!/^([A-z]*|_*)(.sli)$/.test(fileToSave)) {
    alert(
      "File name must contain letters and underscore only, and must end with '.sli' "
    );
    return false;
  }

  let filesObject: { string: string } = getFilesFromStorage();
  filesObject[fileToSave] = get(srcCode);
  localStorage.setItem("files", JSON.stringify(filesObject));

  return true;
};
