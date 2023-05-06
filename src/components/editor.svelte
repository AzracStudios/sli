<script lang="ts">
  import { saveTrigger, srcCode, unsavedChangeTrigger } from "../store";

  let src: string;
  $: src;

  const handleChange = (e: Event) => {
    src = (e.target as HTMLTextAreaElement).value;
    unsavedChangeTrigger.set(true);
  };

  saveTrigger.subscribe((val) => {
    if (val) {
      srcCode.set(src);
      saveTrigger.set(false);
      unsavedChangeTrigger.set(false);
    }
  });

  srcCode.subscribe((val) => {
    src = val;
  });
</script>

<textarea
  spellcheck="false"
  on:input={(e) => handleChange(e)}
  value={src || ""}
/>

<style lang="scss">
  textarea {
    background-color: #282c34;
    resize: none;
    color: rgb(189, 189, 189);
    outline: none;
    border: none;
    width: 50%;
    height: 100%;
    padding: 1rem;
    font-size: 1rem;
  }

  @media only screen and (max-width: 600px) {
    textarea {
      height: 50%;
      width: 100%;
    }
  }
</style>
