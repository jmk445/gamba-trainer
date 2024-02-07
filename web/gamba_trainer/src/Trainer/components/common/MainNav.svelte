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
  import { Link } from "svelte-routing";
  
  import { FromPixels } from "@tensorflow/tfjs";
  import { onMount } from "svelte";
  import { getTrainerADD } from "../../stores/actions";
  import { writable } from "svelte/store";
  import HelpPrompt from "../../../components/general/prompts/HelpPrompt.svelte";
  let showHelpPrompt = false;
  let trainer;
  let trainStore, testStore;
  let trainIsUnlocked = writable();
  let testIsUnlocked = writable();
  let pageNum;
  onMount(async () => {
    trainer = await getTrainerADD();

    await import(`../../src_${trainer}/stores/train/store`).then((module) => {
      trainStore = module;
      trainIsUnlocked = trainStore.trainIsUnlocked;
    });

    await import(`../../src_${trainer}/stores/test/store`).then((module) => {
      testStore = module;
      testIsUnlocked = testStore.testIsUnlocked;
    
    });
  });

  const strAsset = {
    navOne: "사전 설정",
    navTwo: "데이터 수집",
    navThree: "모델 학습",
    navFour: "모델 테스트",
    navFive: "변환/전송",
  };
</script>

<div class="train-nav nav">
  <ul>
    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-settings`,
      )}
    >
      <Link to="/{trainer}-settings">{strAsset.navOne}</Link>
      <button class="btn-help" on:click={()=>{showHelpPrompt=true; pageNum="one"}}>?</button>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-capture`,
      )}
    >
      <Link to="/{trainer}-capture">{strAsset.navTwo}</Link>
      <button class="btn-help" on:click={()=>{showHelpPrompt=true;  pageNum="two";}}>?</button>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${trainer}-train`)}
      class:disabled={!$trainIsUnlocked}
      aria-disabled={!$trainIsUnlocked}      
    >
    
      <Link to="/{trainer}-train">{strAsset.navThree}</Link>
      <button class="btn-help" on:click={()=>{showHelpPrompt=true; pageNum="three";}}>?</button>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${trainer}-test`)}
      class:disabled={!$testIsUnlocked}
      aria-disabled={!$testIsUnlocked}        
    >    
      <Link to="/{trainer}-test">{strAsset.navFour}</Link>
      <button class="btn-help" on:click={()=>{showHelpPrompt=true; pageNum="four";}}>?</button>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-convertSend`,
      )}
    >
      <Link to="/{trainer}-convertSend">{strAsset.navFive}</Link>
      <button class="btn-help" on:click={()=>{showHelpPrompt=true; pageNum="five";}}>?</button>
    </li>
  </ul>
</div>

{#if showHelpPrompt}
<HelpPrompt onClose={() => (showHelpPrompt = false)} pageNum = {pageNum}/>
{/if}
<style lang="scss">
  @import "@scss/vars";
    .btn-help{
        margin-left: 12px;
        width: 24px;
        height: 24px;
        background-color: white;
        color: $color-deepblue;
        border-radius: 50%;
    }
</style>
