<script>
  import Prompt from "./Prompt.svelte";
  import HelpOne_One from "@assets/img/help/helpOne_one.png";
  import HelpOne_two from "@assets/img/help/helpOne_two.png";
  import HelpOne_three from "@assets/img/help/helpOne_three.png";
  import HelpTwo_one from "@assets/img/help/helpTwo_one.png";
  import HelpTwo_two from "@assets/img/help/helpTwo_two.png";
  import HelpTwo_three from "@assets/img/help/helpTwo_three.png";
  import HelpThree_one from "@assets/img/help/helpThree_one.png";
  import HelpThree_two from "@assets/img/help/helpThree_two.png";
  import HelpThree_three from "@assets/img/help/helpThree_three.png";
  import HelpFour_one from "@assets/img/help/helpFour_one.png";
  import HelpFive_one from "@assets/img/help/helpFive_one.png";
  import HelpFive_two from "@assets/img/help/helpFive_two.png";
  import HelpFive_three from "@assets/img/help/helpFive_three.png";
  import HelpFive_four from "@assets/img/help/helpFive_four.png";

  import HelpInner from "../HelpInner.svelte";
  export let onClose = () => {};
  export let pageNum;


const strAsset = {
  bannerTitle : "도움말",
  btnSetting : "사전 설정",
  btnCapture : "데이터 수집",
  btnTrain : "모델 학습",
  btnTest : "모델 테스트",
  btnConvert : "변환/전송",
  helpOne : [
    {desc : "1. '연결' 버튼을 눌러 키트를 연결합니다.",
      img : HelpOne_One},
    {desc : "2. 학습하는데 쓰일 모델 구조를 하나 선택합니다.",
      img : HelpOne_two},
    {desc : "3. 데이터 수집 단계에서 쓸 값들을 설정합니다. 슬라이더를 움직이거나 숫자 입력을 통해 설정을 바꿀 수 있습니다.('예제용 모델 학습' 모드의 경우 설정값을 변경할 수 없습니다.)",
      img : HelpOne_three}
  ],
  helpTwo : [
    {desc :  "1. 원하는 라벨의 이름을 입력합니다.('예제용 모델 학습' 모드의 경우 라벨이 고정되어 있기때문에 새로운 라벨을 생성할 수 없습니다.)",
      img : HelpTwo_one},
    {desc : "2. '기록하기' 버튼을 누르고 키트를 통해 무선으로 해당 라벨의 데이터 수집을 시작합니다.",
      img : HelpTwo_two},
    {desc : "3. 컴퓨터로 전달된 데이터가 스크린에 표시됩니다. 원하는 만큼 데이터를 수집할 수 있습니다.",
      img : HelpTwo_three}
  ],
  helpThree : [
    {desc : "1. epoch는 학습 횟수입니다. 원하는 학습 횟수를 설정합니다.",
      img : HelpThree_one},
    {desc : "2. 특정 값이 나오면 학습을 일찍 종료합니다. 자율선택입니다.",
      img : HelpThree_two},
    {desc : "3. '학습 시작' 버튼을 눌려 모델을 학습합니다.",
      img : HelpThree_three}
  ],
  helpFour : [
    {desc : "1. 모델이 잘 학습되었는지 확인합니다. 각 라벨의 측정값을 막대 그래프를 통해 보여줍니다.",
      img : HelpFour_one}
  ],
  helpFive : [
    {desc : "1. 학습한 모델을 .tflite 파일로 변환시킵니다. 변환이 완료되면 '전송', '다운로드', '예제' 버튼이 활성화됩니다.",
      img : HelpFive_one},
    {desc : "2. 연결된 키트로 변환된 .tflite 파일을 보냅니다.",
      img : HelpFive_two},
    {desc : "3. 변환된 .tflite 파일을 사용자의 기기에서 다운로드합니다.",
      img : HelpFive_three},
    {desc : "4. 원한다면 'TinyML 예제 체험하기' 페이지로 이동합니다.('예제용 모델 학습' 모드의 경우 학습한 모델을 예제에서 체험할 수 있습니다.)",
      img : HelpFive_four}
  ]
}
</script>

<Prompt title={strAsset.bannerTitle} closePrompt={onClose}>
  <div class="inner">
    <div class="btn-container">
      <button class="btn-nav" class:active={pageNum === "one"} on:click={() => pageNum="one"}>{strAsset.btnSetting}</button>
      <button class="btn-nav" class:active={pageNum === "two"} on:click={() => pageNum="two"}>{strAsset.btnCapture}</button>
      <button class="btn-nav" class:active={pageNum === "three"} on:click={() => pageNum="three"}>{strAsset.btnTrain}</button>
      <button class="btn-nav" class:active={pageNum === "four"} on:click={() => pageNum="four"}>{strAsset.btnTest}</button>
      <button class="btn-nav" class:active={pageNum === "five"} on:click={() => pageNum="five"}>{strAsset.btnConvert}</button>
      
    </div>
    <div class="page-container">
      {#if pageNum === "one"}
        <HelpInner exList = {strAsset.helpOne}/>
      {:else if pageNum === "two"}
        <HelpInner exList = {strAsset.helpTwo}/>
      {:else if pageNum === "three"}
        <HelpInner exList = {strAsset.helpThree}/>
      {:else if pageNum === "four"}
        <HelpInner exList = {strAsset.helpFour}/>
      {:else if pageNum === "five"}
        <HelpInner exList = {strAsset.helpFive}/>
      {/if}
    </div>
  </div>
</Prompt>

<style lang="scss">
@import "@scss/vars";
.inner {
  overflow: scroll;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
  max-width: 1132px;
  padding: 18px 92px;
  max-height: 580px;
}
.btn-container{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 36px;
  flex-wrap: wrap;
}
.btn-nav{
    background-color:$color-nav-gray ;
    color: black;
    border-radius: 100px ;
    padding: 12px 48px;
    &:active{
      background-color: $color-nav-blue;
      color: white;
    }
    
  }
  .active{
      background-color: $color-nav-blue;
      color: white;
    }
</style>
