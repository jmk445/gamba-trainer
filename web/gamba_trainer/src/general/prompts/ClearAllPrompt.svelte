<!--
Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

/**
* @author Rikard Lindstrom <rlindstrom@google.com>
*/
-->
<script>
  import { navigate } from "svelte-routing";
  import { clearPersistantStorage } from "@motion/stores/aggregatedActions";
  import Prompt from "./Prompt.svelte";
  import logoPng from "@assets/icons/Symbol_Black_RGB.png";

  export let onClose = () => {};
  function handleClearAll() {
    clearPersistantStorage();
    onClose();
    navigate("motion-settings", { replace: true });
  }
</script>

<Prompt title="Start Over">
  <div class="inner">
    <p class="instructions h2">
      현재까지의 진행상황을 초기화하고 처음부터 다시 진행하시겠습니까? 
    </p>
    <div class="button-row">
      <button class="button primary prompt-button" on:click={onClose}
        >아니요</button
      >
      <button class="button primary prompt-button" on:click={handleClearAll}
        >예</button
      >
    </div>
  </div>
</Prompt>

<style lang="scss">

  .button-row {
    display: flex;
    justify-content: center;
    button {
      width: 184px;
      height: 56px;
      margin: 0 12px !important;
    }
  }
  .instructions {
    margin-bottom: 36px;
  }

  .inner {
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 800px - 60px;
    padding: 100px 70px;
    button {
      margin: 6px auto;
    }
  }

</style>
