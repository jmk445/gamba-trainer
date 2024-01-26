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
  import { addLabel,getLabelCnt } from "../../stores/capture/actions";
  import { labels } from "../../stores/capture/store";
  import { trainIsUnlocked } from "../../stores/train/store";
  import TextInput from "../../../../general/TextInput.svelte";
  import CaptureList from "./CaptureList";
  import Description from "../../../../common/Description.svelte";

  let newLabelName = "";
  let newLabelError = null;

  $: if ($labels.includes(newLabelName)) {
    newLabelError = "Label must be unique";
  } else {
    newLabelError = "";
  }

  function handleAddLabel() {   
    newLabelError = null;
    if (newLabelName.length > 0) {
      try {
        addLabel(newLabelName);
        newLabelName = "";
      } catch (e) {
        newLabelError = e.toString();
      }
    }
  }

</script>

<!-- <Description title="데이터 캡처"
             explanation="각 제스처에 대한 데이터를 기록하기 위해 새 레이블을 만듭니다. 모델을 훈련시키려면 제스처를 최소 2개, 샘플을 최소 3개 이상 선택해야 하지만, 더 나은 결과를 위해 최소 20개의 샘플을 기록하는 것이 좋습니다. 설정에서 더 적은 수의 샘플을 선택하면 이 프로세스가 가속화됩니다"/>
<div class="row data-capture-container"> -->
  <TextInput
    label="라벨의 이름을 입력하세요"
    bind:value={newLabelName}
    onEnter={handleAddLabel}
    errorMessage={newLabelError}
  />
  <button
    class="button primary"
    disabled={newLabelName.length === 0 || newLabelError}
    on:click={handleAddLabel}>Create new</button
  >
<!-- </div> -->

<CaptureList />

<!-- {#if !$trainIsUnlocked}
  <div class="row warning notation-text">
    * We need at least 2 labels and 3 recordings for each. Recommended is at
    least 2- recordings for each label.
  </div>
{/if} -->
<style lang="scss">

    button {
      margin-left: 1rem;
    }

</style>
