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

  let trainer, trainer_;
  let trainStore, testStore;
  let trainIsUnlocked = writable();
  let testIsUnlocked = writable();
  
  onMount(async () => {
    trainer = await getTrainerADD();
    trainer_ = trainer;
    if (trainer = "FUI"){
      trainer = "motion";
    }

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
        BASE_PATH + `/${trainer_}-settings`,
      )}
    >
      <Link to="/{trainer_}-settings">{strAsset.navOne}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer_}-capture`,
      )}
    >
      <Link to="/{trainer_}-capture">{strAsset.navTwo}</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${trainer_}-train`)}
      class:disabled={!$trainIsUnlocked}
      aria-disabled={!$trainIsUnlocked}      
    >
    
      <Link to="/{trainer_}-train">{strAsset.navThree}</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${trainer_}-test`)}
      class:disabled={!$testIsUnlocked}
      aria-disabled={!$testIsUnlocked}        
    >    
      <Link to="/{trainer_}-test">{strAsset.navFour}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer_}-convertSend`,
      )}
    >
      <Link to="/{trainer_}-convertSend">{strAsset.navFive}</Link>
    </li>
  </ul>
</div>

<style lang="scss">
  @import "@scss/vars";
</style>
