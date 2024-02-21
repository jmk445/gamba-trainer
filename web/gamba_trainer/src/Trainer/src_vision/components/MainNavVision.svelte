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
  import { writable } from "svelte/store";
  import { trainIsUnlocked } from "../stores/train/store";
  import { testIsUnlocked} from "../stores/test/store"

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
        BASE_PATH + `/vision-settings`,
      )}
    >
      <Link to="/vision-settings">{strAsset.navOne}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/vision-capture`,
      )}
    >
      <Link to="/vision-capture">{strAsset.navTwo}</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/vision-train`)}
      class:disabled={!$trainIsUnlocked}
      aria-disabled={!$trainIsUnlocked}      
    >
    
      <Link to="/vision-train">{strAsset.navThree}</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/vision-test`)}
      class:disabled={!$testIsUnlocked}
      aria-disabled={!$testIsUnlocked}        
    >    
      <Link to="/vision-test">{strAsset.navFour}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/vision-convertSend`,
      )}
    >
      <Link to="/vision-convertSend">{strAsset.navFive}</Link>
    </li>
  </ul>
</div>

<style lang="scss">
  @import "@scss/vars";
</style>