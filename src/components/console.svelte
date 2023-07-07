<script lang="ts">
  import { output } from "../store";
  import "./console.scss";

  let consoleLines: string[];
  $: consoleLines = [];

  output.subscribe((val) => {
    consoleLines = val;
  });
</script>

<div class="console">
  <div class="head">
    <p>Output</p>
    <button on:click={() => output.set([])}>Clear</button>
  </div>

  <div class="output">
    {#each consoleLines as line}
      <p>{line}</p>
    {/each}
  </div>
</div>
