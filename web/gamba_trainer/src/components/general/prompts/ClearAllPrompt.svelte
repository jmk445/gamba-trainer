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
  import Prompt from "./Prompt.svelte";
  import logoPng from "@assets/icons/Symbol_Black_RGB.png";
  import { onMount } from "svelte";
  import { getTrainerADD } from "../../../Trainer/stores/actions";

  export let onClose = () => {};

  let trainer;
  let aggregatedActions;
  onMount(async () => {
    trainer = await getTrainerADD();    
    await import(`../../../Trainer/src_${trainer}/stores/aggregatedActions`).then(
      (module) => {
        aggregatedActions = module;        
      },
    );
  });

  function handleClearAll() {
    // if (trainer == "motion") {
    //   clearPersistantStorageMotion();
    //   console.log("hello");
    //   onClose();
    //   navigate("motion-settings", { replace: true });
    // } else if (trainer == "speech") {
    //   clearPersistantStorageSpeech();
    //   onClose();
    //   navigate("speech-settings", { replace: true });
    // }
      aggregatedActions.clearPersistantStorage();
      onClose();      
      navigate(`/${trainer}-settings`, {replace: false });
  }
  
  const strAsset = {
    promptTitle: "Start Over",
    promptDesc:
      "현재까지의 진행상황을 초기화하고 처음부터 다시 진행하시겠습니까?",
    promptNo: "아니요",
    promptYes: "예",
  };
</script>

<Prompt title={strAsset.promptTitle} closePrompt={onClose}>
  <div class="inner">
    <p class="instructions h2">
      {strAsset.promptDesc}
    </p>
    <div class="button-row">
      <button class="btn-fill primary prompt-button" on:click={onClose}
        >{strAsset.promptNo}</button
      >
      <button class="btn-fill primary prompt-button" on:click={handleClearAll}
        >{strAsset.promptYes}</button
      >
    </div>
  </div>
</Prompt>

<style lang="scss">
  .instructions {
    margin-bottom: 36px;
  }

  .inner {
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 800px - 60px;
    padding: 100px 70px;

    .button-row {
      display: flex;
      justify-content: center;
      button {
        width: 184px;
        height: 56px;
        margin: 6px auto;
      }
    }
  }
</style>
