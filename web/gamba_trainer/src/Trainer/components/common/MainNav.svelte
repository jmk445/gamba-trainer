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
  import { testIsUnlockedMotion } from "../../src_motion/stores/test/store";
  import { trainIsUnlockedMotion } from "../../src_motion/stores/train/store";
  import { trainIsUnlockedSpeech } from "../../src_speech/stores/train/store";
  import { testIsUnlockedSpeech } from "../../src_speech/stores/train/store";
  import { FromPixels } from "@tensorflow/tfjs";
  import { onMount } from "svelte";
  import { getTrainerADD } from "../../stores/actions";

  let trainer;
  onMount(async () => {
    trainer = await getTrainerADD();
  });

  const strAsset = {
    navOne: "사전 설정",
    navTwo: "데이터 수집",
    navThree: "모델 학습",
    navFour: "모델 테스트",
    navFive: "변환/전송",
  };
</script>

<!-- {#if trainer}
<p>Current Value: {getTrainer()}</p>
{/if} -->
<div class="train-nav nav">
  <ul>
    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-settings`,
      )}
    >
      <Link to="/{trainer}-settings">{strAsset.navOne}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-capture`,
      )}
    >
      <Link to="/{trainer}-capture">{strAsset.navTwo}</Link>
    </li>
    {#if trainer == "motion"}
      <li
        class:active={location.pathname.includes(
          BASE_PATH + `/${trainer}-train`,
        )}
        class:disabled={!$trainIsUnlockedMotion}
        aria-disabled={!$trainIsUnlockedMotion}
      >
        <Link to="/{trainer}-train">{strAsset.navThree}</Link>
      </li>

      <li
        class:active={location.pathname.includes(BASE_PATH + `/{trainer}-test`)}
        class:disabled={!$testIsUnlockedMotion}
        aria-disabled={!$testIsUnlockedMotion}
      >
        <Link to="/{trainer}-test">{strAsset.navFour}</Link>
      </li>
    {/if}

    {#if trainer == "speech"}
      <li
        class:active={location.pathname.includes(
          BASE_PATH + `/{trainer}-train`,
        )}
        class:disabled={!$trainIsUnlockedSpeech}
        aria-disabled={!$trainIsUnlockedSpeech}
      >
        <Link to="/{trainer}-train">{strAsset.navThree}</Link>
      </li>

      <li
        class:active={location.pathname.includes(BASE_PATH + `/{trainer}-test`)}
        class:disabled={!$testIsUnlockedSpeech}
        aria-disabled={!$testIsUnlockedSpeech}
      >
        <Link to="/{trainer}-test">{strAsset.navFour}</Link>
      </li>
    {/if}

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/{trainer}-convertSend`,
      )}
    >
      <Link to="/{trainer}-convertSend">{strAsset.navFive}</Link>
    </li>
  </ul>
</div>

<style lang="scss">
  @import "@scss/vars";
</style>
