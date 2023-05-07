<script lang="ts">
  import { get } from "svelte/store";
  import { cursorPosition, tempSrc, triggerCursorReposition } from "./editor/editorStore";
  import { srcCode } from "../store";

  export let char = "";
  $: char;

  export const insert = () => {
    const src = get(srcCode);
    const start = get(cursorPosition);
    srcCode.set(
      `${src.slice(0, start)}${char}${src.slice(
        start + char.length - 1,
        src.length
      )}`
    );

    cursorPosition.set(start + char.length - 1);
    triggerCursorReposition.set(true);
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={() => insert()} class="char">{char}</div>

<style lang="scss">
  .char {
    font-family: sans-serif;
    color: white;
    padding-inline: 0.5rem;
    padding-block: 0.2rem;
    background-color: rgba(255, 255, 255, 0.15);
    cursor: pointer;
    border-radius: 0.4rem;
  }
</style>
