<!-- <script>
    import Description from "../../../../common/Description.svelte";
    import arrowRight from "@assets/icons/arrow_right.png";
</script>

<Description
    title="모델 변환 및 전송"
    explanation="학습된 모델을 .tflite 확장자 모델로 변환 후 키트에 전송합니다. 원하는 경우 모델을 다운로드할 수 있습니다. Application Mode로 시작했다면, Application으로 이동 버튼이 활성화됩니다."
/>
<div class="progress-container">
    <div class="btn-container">
        <button class="btn-convert button"> Convert</button>
        <button class="btn-send button" disabled> Send</button>
        <button class="btn-download button" disabled> Download</button>
    </div>
    <div id="myProgress">
        <div id="myBar"></div>
    </div>
</div>
<div class="move-page">
    <button class="btn-move button" disabled>
        <img src={arrowRight} alt="arrow" /> Application에서 체험
    </button>

    <button class="btn-home button">
        <img src={arrowRight} alt="arrow" />메인으로 돌아가기
    </button>
</div>

<style lang="scss">
    .progress-container {
        margin-bottom: 58px;
    }
    .btn-container {
        margin-bottom: 12px;
    }
    .btn-download,
    .btn-move,
    .btn-home {
        float: right;
    }
    .btn-convert {
        margin-right: 12px;
    }
    .progress-container {
        margin-bottom: 58px;
    }
    #myProgress {
        width: 100%;
        height: 12px;
        background-color: #dbdbdb;
        border-radius: 50px;
    }
    #myBar {
        width: 10%;
        height: 100%;
        background-color: aqua;
        border-radius: 50px;
    }
    .btn-move {
        margin-bottom: 16px;
    }
    .btn-move,
    .btn-home {
        display: block;
        margin-left: 12px;
    }
    img {
        margin-right: 12px;
    }
</style> -->
