<script lang="ts">
  import { get } from "svelte/store";
  import { fileDoesExist, fileName, saveTrigger } from "../../store";
  import { saveFileToStorage } from "../menu_helper";
  import "./modal.scss";

  // HANDLE SAVE FILE
  $: showSaveModal = false;

  let fileNameInput: string;
  $: fileNameInput;

  const save = () => {
    saveTrigger.set(true);

    if (get(fileDoesExist)) {
      saveFileToStorage(get(fileName));
    } else {
      showSaveModal = true;
    }
  };

  const handleSaveModal = () => {
    if (fileNameInput == undefined)
      return alert("Enter a valid file name to save");

    if (!saveFileToStorage(fileNameInput)) return;
    fileDoesExist.set(true);
    fileName.set(fileNameInput);

    showSaveModal = false;
  };

  const handleFileNameInput = (e: Event) => {
    fileNameInput = (e.target as HTMLInputElement).value;
  };
</script>

<button on:click={() => save()}>Save</button>

{#if showSaveModal}
  <div class="modal">
    <div class="content">
      <div class="head">
        <p>Save File</p>
        <button on:click={() => (showSaveModal = false)}>x</button>
      </div>
      <input
        type="text"
        on:input={(e) => handleFileNameInput(e)}
        required
        value={fileNameInput || ""}
      />
      <button on:click={() => handleSaveModal()}>Save</button>
    </div>
  </div>
{/if}
