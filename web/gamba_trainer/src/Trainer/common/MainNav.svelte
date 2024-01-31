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
  import {trainerADD} from "../store/store"
  import { testIsUnlocked } from "../src_motion/stores/test/store";
  import { trainIsUnlocked } from "../src_motion/stores/train/store";
    import { FromPixels } from "@tensorflow/tfjs";
    import { onMount } from "svelte";
  let trainer;
  // $: trainer = $trainerADD;
  onMount =(() => {
    
    console.log("mainNav-trainerADD :" + $trainerADD);
  })
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
        BASE_PATH + `/${$trainerADD}-settings`,
      )}
    >
      <Link to="{$trainerADD}-settings">{strAsset.navOne}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${$trainerADD}-capture`,
      )}
    >
      <Link to="{$trainerADD}-capture">{strAsset.navTwo}</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${$trainerADD}-train`)}
      class:disabled={!$trainIsUnlocked}
      aria-disabled={!$trainIsUnlocked}
    >
      <Link to="{$trainerADD}-train">{strAsset.navThree}</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${$trainerADD}-test`)}
      class:disabled={!$testIsUnlocked}
      aria-disabled={!$testIsUnlocked}
    >
      <Link to="{$trainerADD}-test">{strAsset.navFour}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${$trainerADD}-convertSend`,
      )}
    >
      <Link to="{$trainerADD}-convertSend">{strAsset.navFive}</Link>
    </li>
  </ul>
</div>

<style lang="scss">
  @import "@scss/vars";

</style>
