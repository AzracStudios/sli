<script lang="ts">
  import { confirmDiscardUnsavedChanges, run } from "./menu_helper";
  import { fileDoesExist, fileName, srcCode } from "../store";
  
  import "./menu.scss";
  import Save from "./modals/save.svelte";
  import Load from "./modals/load.svelte";

  // HANDLE CREATE NEW FILE
  const create = () => {
    if (!confirmDiscardUnsavedChanges()) return;
    srcCode.set("");
    fileName.set("untitiled.sli");
    fileDoesExist.set(false);
  };
</script>

<div class="menu">
  <p><strong>{"{...}"}</strong></p>
  <button on:click={() => create()}>New</button>
  <Save />
  <Load />
  <button on:click={() => run()}>Run</button>
</div>
