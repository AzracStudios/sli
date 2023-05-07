<script lang="ts">
  import { output } from "../store";

  let consoleLines: string[];
  $: consoleLines = [];

  output.subscribe((val) => {
    consoleLines = val;
  });
</script>

<div class="console">
  <div class="head">
    <p>Output</p>
    <button on:click={() => (output.set([]))}>Clear</button>
  </div>

  <div class="output">
    {#each consoleLines as line}
      <p>{line}</p>
    {/each}
  </div>
</div>

<style lang="scss">
  .console {
    width: 50%;
    height: 100%;
    background-color: #282c34;

    resize: horizontal;
    padding-inline: 1rem;
    z-index: 11;
  }

  .head {
    display: flex;
    justify-content: space-between;
    padding-block: 0.5rem;

    p {
      color: white;
      font-weight: 500;
    }

    button {
      background: rgba(255, 255, 255, 0.089);
      color: white;
      outline: none;
      border: none;
      cursor: pointer;
      border-radius: 0.2rem;
      padding-inline: 0.5rem;
      padding-block: 0.3rem;
      font-size: 0.8rem;
    }
  }

  .output {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-top: 1rem;

    p {
      color: rgb(200, 200, 200);
    }
  }

  @media only screen and (max-width: 600px) {
    .console {
      height: 50%;
      width: 100%;
      border-top: 5px solid #2e333b;
      border-left: none;
    }
  }
</style>
