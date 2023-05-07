<script lang="ts">
  import { get } from "svelte/store";
  import {
    fileDoesExist,
    fileName,
    srcCode,
    unsavedChangeTrigger,
  } from "../../store";

  import {
    confirmDiscardUnsavedChanges,
    getFilesFromStorage,
  } from "../menu_helper";

  import "./modal.scss";

  $: showLoadModal = false;
  let savedFiles: { string: string } | undefined;

  const load = () => {
    savedFiles = getFilesFromStorage();
    showLoadModal = true;
  };

  const deleteFile = (fileToDelete: string) => {
    if (!confirm(`Are you sure you want to delete ${fileToDelete}?`)) return;
    
    let existingFiles = getFilesFromStorage();
    delete existingFiles[fileToDelete];
    localStorage.setItem("files", JSON.stringify(existingFiles));
    showLoadModal = false;

    if (get(fileName) !== fileToDelete) return;
    fileDoesExist.set(false);
    fileName.set("untitled.sli");
    unsavedChangeTrigger.set(true);
  };

  const loadFile = (fileToLoad: string) => {
    let existingFiles = getFilesFromStorage();

    if (confirmDiscardUnsavedChanges()) {
      srcCode.set(existingFiles[fileToLoad]);
      fileName.set(fileToLoad);
      fileDoesExist.set(true);
    }
    showLoadModal = false;
  };
</script>

<button on:click={() => load()}>Load</button>

{#if showLoadModal}
  <div class="modal">
    <div class="content">
      <div class="head">
        <p>Load File</p>
        <button on:click={() => (showLoadModal = false)}>x</button>
      </div>

      {#if Object.keys(savedFiles).length === 0 && savedFiles.constructor === Object}
        <p><strong>No Files In Local Storage!</strong></p>
      {/if}

      <div class="files">
        {#each Object.entries(savedFiles) as [name, _]}
          <div class="chip">
            <p>{name}</p>

            <div class="action">
              <button
                on:click={() => {
                  loadFile(name);
                }}>Load</button
              >
              <button
                on:click={() => {
                  deleteFile(name);
                }}>Delete</button
              >
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
