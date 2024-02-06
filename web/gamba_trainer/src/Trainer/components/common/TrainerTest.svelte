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
  import { isConnected } from "@motion/stores/bleInterfaceStore/store";
  // import { labels } from "@motion/stores/capture/store";
  import { beginTesting, endTesting } from "@motion/stores/test/actions";
  import { testIsUnlocked, testPredictions } from "@motion/stores/test/store";
  import { isFullyLoaded } from "@motion/stores/ui/store";
  // import LinearProgress from "../../../../general/LinearProgress.svelte";
  import Description from "../../../components/common/Description.svelte";
  import FloatingBtn from "../../../general/floating/floatingBtn.svelte";

  onMount(async () => {
    let unsubFromConnect;
    let isDestroyed = false;
    setTimeout(async () => {
      if ($isConnected) {
        await beginTesting();
      } else {
        unsubFromConnect = isConnected.subscribe(async ($isConnected) => {
          if ($isConnected) {
            if (!isDestroyed) {
              await beginTesting();
            }
            unsubFromConnect();
          }
        });
      }
    }, 100);

    return () => {
      isDestroyed = true;
      if (unsubFromConnect) {
        unsubFromConnect();
      }
      endTesting();
    };
  });

  $: if ($isFullyLoaded) {
    if (!$testIsUnlocked) {
      navigate(BASE_PATH, { replace: true });
    }
  }
</script>

<div class="contents">
  <Description
    title="모델 테스트"
    explanation="언제든지 데이터를 다시 캡처할 수 있습니다."
  />

  <div class="column stack">
    <slot name="test-progress" />
    <!-- {#each $labels as label, index}
      <div class="panel">
        <div>
          <span class="label">{label}</span><span class="result"
            >{Math.round(
              !$testPredictions ? 0 : $testPredictions[index] * 100
            )}%</span>
        </div>
        <LinearProgress
          progress={!$testPredictions ? 0 : $testPredictions[index]}
        />
      </div>
    {/each} -->
  </div>
</div>
<FloatingBtn/>

<style lang="scss">
  // .panel{
  //   margin-bottom: 60px;
  // }
  // .panel > div {
  //   display: flex;
  //   flex-direction: row;
  //   justify-content: space-between;
  // }
  // .label {
  //   font-size: 16px;
  //   font-weight: 400;
  //   margin-bottom: 10px;
  // }
</style>