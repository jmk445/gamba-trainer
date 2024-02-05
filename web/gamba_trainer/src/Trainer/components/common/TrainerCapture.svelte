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
  import Description from "../../../components/common/Description.svelte";
 
  const strAsset = {
    captureTitle : "데이터 수집",
    captureDesc : "각 제스처에 대한 데이터를 기록하기 위해 새 라벨을 만듭니다. 모델을 훈련시키려면 제스처를 최소 2개, 샘플을 최소 3개 이상 선택해야 하지만, 더 나은 결과를 위해 최소 20개의 샘플을 기록하는 것이 좋습니다. 설정에서 더 적은 수의 샘플을 선택하면 프로세스가 가속화됩니다",

  }
</script>

<div class="contents">
  <Description
    title={strAsset.captureTitle}
    explanation={strAsset.captureDesc}
  />
  <div class="row data-capture-container">
    <slot name="capture-label" />    
  </div>
  <slot name="capture-list" />  
</div>

<style lang="scss">
  
  .data-capture-container{
    margin-bottom: 64px;
  }
</style>
