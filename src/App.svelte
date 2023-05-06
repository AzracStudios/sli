<script lang="ts">
  import { get } from "svelte/store";
  import Console from "./components/console.svelte";
  import Editor from "./components/editor.svelte";
  import Menu from "./components/menu.svelte";
  import {
    fileDoesExist,
    fileName,
    srcCode,
    unsavedChangeTrigger,
  } from "./store";
  import { onMount } from "svelte";
  import { getFilesFromStorage } from "./components/menu_helper";

  let pageTitle: string = "untitled.sli";
  $: pageTitleState = pageTitle;

  onMount(() => {
    fileName.set("untitled.sli");
  });

  unsavedChangeTrigger.subscribe((val: boolean) => {
    if (val) {
      pageTitleState = `*${pageTitle}`;
      return;
    }

    pageTitleState = pageTitle;
  });

  fileName.subscribe((val: string | undefined) => {
    if (!val) return;
    pageTitle = val;
    pageTitleState = pageTitle;
  });
</script>

<svelte:head>
  <title>{pageTitleState}</title>
</svelte:head>

<svelte:window
  on:beforeunload={() => {
    // Keep track of the file that is currently being edited before exit
    localStorage.setItem("last_file", JSON.stringify(get(fileName)));
  }}
  on:load={() => {
    // Load the last file that was edited on launch
    if (localStorage.getItem("last_file")) {
      let fileToLoad = JSON.parse(localStorage.getItem("last_file"));
      let existingFiles = getFilesFromStorage();
      srcCode.set(existingFiles[fileToLoad]);
      fileName.set(fileToLoad);
      fileDoesExist.set(true);
    }
  }}
/>

<div class="code-editor">
  <Menu />
  <div class="wrapper">
    <Editor />
    <Console />
  </div>
</div>

<style lang="scss">
  .code-editor {
    height: 100svh;
  }

  .wrapper {
    display: flex;
    width: 100svw;
    height: calc(100% - 3rem);
  }

  @media only screen and (max-width: 600px) {
    .wrapper {
      flex-direction: column;
    }
  }
</style>
