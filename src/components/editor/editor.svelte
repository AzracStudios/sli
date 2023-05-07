<script lang="ts">
  import Char from "../char.svelte";
  import { saveTrigger, srcCode, unsavedChangeTrigger } from "../../store";
  import { cursorPosition, triggerCursorReposition } from "./editorStore";
  import { highlight } from "./highlight";

  import "./highlight.scss";
  import "./editor.scss";
  import { onMount } from "svelte";
  import { specIdent, specOp } from "../../language/constants";
  import { get } from "svelte/store";

  let src: string;
  $: src;

  const highlightCode = () => {
    let codeDom = document.querySelector(".highlighted_code");
    if (!codeDom) return;
    codeDom.innerHTML = highlight(src || "");
  };

  const handleChange = (e: Event) => {
    src = (e.target as HTMLTextAreaElement).value;

    srcCode.set(src);
    unsavedChangeTrigger.set(true);
    highlightCode();
    handleSelection(e);
    cursorPosition.set(src.length);
  };

  onMount(() => highlightCode());

  const handleSelection = (e: Event) => {
    const element: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
    cursorPosition.set(element.selectionStart);
  };

  saveTrigger.subscribe((val) => {
    if (val) {
      srcCode.set(src);
      saveTrigger.set(false);
      unsavedChangeTrigger.set(false);
    }
  });

  triggerCursorReposition.subscribe((val) => {
    if (!val) return;
    const element: HTMLTextAreaElement = document.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
    if (!element) return;
    element.focus();
    element.setSelectionRange(get(cursorPosition), get(cursorPosition));
    triggerCursorReposition.set(false);
  });

  srcCode.subscribe((val) => {
    if (src != val) src = val;
    highlightCode();
  });
</script>

<div class="editor">
  <div class="char_bar">
    <div class="row">
      {#each specOp as char}
        <Char {char} />
      {/each}
    </div>

    <div class="row">
      {#each specIdent as char}
        <Char {char} />
      {/each}
    </div>
  </div>

  <div class="core_wrapper">
    <div class="line_nums">
      {#each Array(src?.split("\n").length) as _, idx}
        <p>{idx + 1}</p>
      {/each}
    </div>
    <div class="input_wrapper">
      <textarea
        spellcheck="false"
        rows="{src?.split("\n").length}"
        on:input={(e) => handleChange(e)}
        on:click={(e) => handleSelection(e)}
        value={src || ""}
      />
      <div class="highlighted_code" />
    </div>
  </div>
</div>
