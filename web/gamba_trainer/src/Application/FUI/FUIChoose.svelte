<script>
    import AppMain from "../common/AppMain.svelte";
    import Description from "../../common/Description.svelte";

    function handleChoose(){
        
    }

    function handleCheckModel(){
        
    }
</script>

<AppMain title="FUI" appName="fui">
    <div class="model-choose-container">
        <Description
            title="모델 선택 및 전송"
            explanation="TF4Micro 모션 키트는 저전력 블루투스를 통해 본 웹사이트와 소통하므로 무선 경험을 할 수 있습니다. 첫째, Motion Trainer를 통해 구체적인 제스처를 학습하고 모델을 다운로드합니다. 둘째, 저장된 모델에 .tflite 확장자를 로드하고 Send 버튼을 클릭하여 모델을 ESP32s3 보드로 전송합니다."
        />
        <div class="confirm-model-container">
            <h2>1. Kit 모델 확인</h2>
            <p>
                키트에 Application과 호환되는 모델이 저장되어 있는 지 확인하는
                과정입니다. 모델이 저장되어 있다면, 저장된 모델로 아래의 과정을
                생략하고, Application을 바로 체험할 수 있습니다. 모델의 유무와
                상관 없이, 새로운 모델을 선택하여 Send하고, Application을 체험할
                수 있습니다.
            </p>
            <div class="btn-container">
                <button class="btn-start button" on:click={handleCheckModel()}> Start</button>
                <button class="btn-app button" disabled>
                    <img src="#" />Application으로 이동</button
                >
            </div>
            <div id="myProgress" hidden>
                <div id="myBar"></div>
            </div>
        </div>
        <div class="choose-model-container">
            <h2>2. 모델 선택</h2>
            <p>
                원하는 모델을 선택할 수 있습니다. PC로부터 업로드 또는 메모리에
                내장되어 있는 예제 모델을 선택할 수 있습니다.
            </p>
            <div class="btn-container">
                <button class="btn-select-model button"> 모델 선택</button>
                <button class="btn-ex button" on:click={handleChoose()}>
                    예제모델 선택<img src="#" /></button
                >
            </div>
        </div>
        <div class="send-model-container">
            <h2>3. Send</h2>
            <p>
                선택한 모델을 Kit로 보냅니다. Send가 완료되면 Application을
                체험할 수 있습니다.
            </p>
            <div class="btn-container">
                <button class="btn-send button"> Send</button>
                <!-- <span>Send가 완료되었습니다.</span> -->
            </div>
            <div class="myProgress" hidden>
                <div class="myBar"></div>
            </div>
        </div>
    </div>
</AppMain>

<style lang="scss">
    .confirm-model-container p,
    .choose-model-container p,
    .send-model-container p {
        margin-bottom: 50px;
    }
    .btn-container {
        margin-bottom: 36px;
    }
    .btn-app {
        float: right;
    }
    .confirm-model-container,
    .choose-model-container,
    .send-model-container {
        margin-bottom: 118px;
    }
    .btn-select-model {
        margin-right: 24px;
    }
</style>
