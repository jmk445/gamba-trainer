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
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { isConnected } from "@vision/stores/bleInterfaceStore/store";
    import { labels } from "@vision/stores/capture/store";
    import { beginTesting, endTesting } from "@vision/stores/test/actions";
    import { testIsUnlocked, testPredictions } from "@vision/stores/test/store";
    import { isFullyLoaded } from "@vision/stores/ui/store";
    import TrainerTest from "../../../components/common/TrainerTest.svelte";
    import LinearProgress from "../../../../components/general/LinearProgress.svelte";
    // import Description from "../../../../common/Description.svelte";
    // onMount(async () => {
    //   let unsubFromConnect;
    //   let isDestroyed = false;
    //   setTimeout(async () => {
    //     if ($isConnected) {
    //       await beginTesting();
    //     } else {
    //       unsubFromConnect = isConnected.subscribe(async ($isConnected) => {
    //         if ($isConnected) {
    //           if (!isDestroyed) {
    //             await beginTesting();
    //           }
    //           unsubFromConnect();
    //         }
    //       });
    //     }
    //   }, 100);
  
    //   return () => {
    //     isDestroyed = true;
    //     if (unsubFromConnect) {
    //       unsubFromConnect();
    //     }
    //     endTesting();
    //   };
    // });
  
    // return () => {
    //   isDestroyed = true;
    //   if (unsubFromConnect) {
    //     unsubFromConnect();
    //   }
    //   endTesting();
    // };
  // });

  $: if ($isFullyLoaded) {
    if (!$testIsUnlocked) {
      navigate(BASE_PATH, { replace: true });
    }
  }

  const strAsset = {
    btnStart : "테스트 시작"
  }

</script>

<TrainerTest>
  <div slot="test-progress" class="column stack">
    <button class="btn-stroke btn-test" on:click={beginTesting}>{strAsset.btnStart}</button>
    {#each $labels as label, index}
      <div class="panel">
        <div>
          <span>{label}</span><span class="result"
            >{Math.round(
              !$testPredictions ? 0 : $testPredictions[index] * 100,
            )}%</span
          >
        </div>
        <LinearProgress
          progress={!$testPredictions ? 0 : $testPredictions[index]}
        />
      </div>
    {/each}
  </div>
</TrainerTest>

<style lang="scss">
  .btn-test{
    margin-bottom:32px ;
  }
  .panel {
    margin-bottom: 60px;
  }
  .panel > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .label {
    font-size: 16px;
    font-weight: 400;
    margin-bottom: 10px;
  }
</style>