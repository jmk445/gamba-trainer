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
  // import { navigate } from "svelte-routing";
  // import { clearPersistantStorage } from "@motion/stores/aggregatedActions";
  import Prompt from "./Prompt.svelte";
  import logoPng from "@assets/icons/Symbol_Black_RGB.png";
  let helpPage = 1;
  export let onClose = () => {};
  // function handleClearAll() {
  //   clearPersistantStorage();
  //   onClose();
  //   navigate("motion-settings", { replace: true });
  // }
</script>

<Prompt title="Help">
  <div class="inner">
    <p class="helpCaption">
      감바 트레이너 서비스는 일반인들이 AI를 보다 친숙하게 여기고 자유롭게
      활용할 수 있도록 도와주는 교육 서비스입니다. 여러분이 선택한 Mode에 따라
      모델을 트레이닝 시킬 수 있습니다.
    </p>
    {#if helpPage===1}
    <div class="mode-explanation">
      <h3>Basic Mode</h3>
      <ol>
        <li>
          베이직 모드에서는 사용자가 자유롭게 캡처 설정 혹은 모델 설정을 할 수
          있습니다.
        </li>
        <li>
          데이터 캡처를 진행할 Label 이름과 갯수를 자유롭게 정할 수 있습니다.
        </li>
        <li>
          ‘모델 변환 및 전송’ 단계에서는 모델을 키트로 전송하거나 PC 다운로드를
          함으로써 모델 트레이닝 경험을 마칠 수 있습니다. 이 과정에서 트레이닝된
          모델은 Application과 호환되지 않습니다. 따라서, 예제 모델로
          Application 을 체험해볼 수 있습니다.
        </li>
      </ol>
      <div class="btn-tri right" on:click={()=>{helpPage=2;console.log(helpPage);}} tabindex="0"></div>
    </div>
  {:else if helpPage===2}
  <div class="mode-explanation">
    <h3>Application Mode</h3>
    <ol>
      <li>
        어플리케이션 모드에서는 선택한 어플리케이션에 따라 고정된 설정값을 가지고 모델을 트레이닝할 수 있습니다.
      </li>
      <li>
        어플리케이션에 따라 Label 이름과 갯수가 고정되어 있습니다.
      </li>
      <li>
        ‘모델 변환 및 전송’ 단계에서는 모델을 키트로 전송하거나 PC 다운로드를 
        할 수 있습니다. 키트 전송이 완료되면, Application에서 체험 버튼이 
        활성화됩니다. 클릭 시, Application으로 넘어가며, 생성한 모델을 가지고 
        Appliucation을 체험할 수 있습니다.
      </li>
    </ol>
    <div class="btn-tri left" on:click={()=>{helpPage=1;console.log(helpPage);}} tabindex="0"></div>
  </div>
  {/if}
</div>

</Prompt>

<style lang="scss">
  // .button-row {
  //   display: flex;
  //   justify-content: center;
  //   button {
  //     width: 184px;
  //     height: 56px;
  //     margin: 0 12px !important;
  //   }
  // }
  .helpCaption {
    margin-bottom: 12px;
  }

  .inner {
    position: relative;
    // text-align: center;
    z-index: 1;
    max-width: 1132px;
    padding: 18px 92px;
  }
  .mode-explanation {
    position: relative;
    border-radius: 8px;
    background-color: #f6f1d0;
    padding: 24px;
    h3 {
      margin-bottom: 22px;
      font-size: 1.5rem;
    }
    ol {
      list-style-type: decimal-leading-zero;
    }
    li {
      margin-bottom: 24px;
      font-size: 0.875rem;
    }
    .btn-tri{
      position: absolute;
      top: calc(50% - 50px);
      color: #f6f1d0;
      width: 0;
      height: 0;
      border-top: 50px solid transparent;
      border-bottom: 50px solid transparent;
      cursor: pointer;
      
      &:hover{
        filter:brightness(40%);
      }
    }
    .right{
      float: right;
      right: -40px;
      border-left: 30px solid #f6f1d0;
    }
    .left{
      float: left;
      left: -40px;
      border-right: 30px solid #f6f1d0;
    }
  }
</style>
