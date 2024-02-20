<script>
    import AppMain from "../components/common/AppMain.svelte";
    import Description from "../../components/common/Description.svelte";
    import {
        handleSendModel,
        handleFileInput,
    } from "./stores/tf4micro-motion-kit copy.js";

    let fileInput$1 = 0;

    //텍스트 띄우는 용도
    let isStart = false;
    let isErrorStart = false;
    let isSelect = false;
    let isErrorSelect = false;
    let isSend = false;


    function handleButtonClick() {                
        fileInput$1.click();        
    }

    function handleFileChange(event) {
        const fileInput = event.target;        
        if (fileInput.files.length > 0) {            
            const file = fileInput.files[0];
            handleFileInput(file);
        }
    }

    //사용자가 입력한 file에서 model(.tflite)을 가져옵니다.
    function handleSendModelInterface() {
        handleSendModel_(0);
    }

    //IDB에서 model(.tflite)을 가져옵니다.
    function handleSendModelInterface$1() {
        handleSendModel_(1);
    }

    function handleSendModel_(fromIDB) {
        // let experimentConfig;
        // const defaultConfig = {
        //     autoTransfer: true,
        // };
        // const modelConfig = {
        //     //model: "./model.tflite",
        //     numClasses: 5,
        //     threshold: 0.181,
        //     numSamples: 25,
        //     captureDelay: 30,
        //     useMagnetometer: false,
        // };

        // experimentConfig = { ...defaultConfig, ...modelConfig };
        
        //handleClickConnect(modelConfig);

        handleSendModel(fromIDB);
    }
    const strAsset = {
        bannerTitle : "MOLE",
        selectTitle : "모델 선택 및 전송",
        selectDesc : 'TF4Micro 모션 키트는 저전력 블루투스를 통해 본 웹사이트와 소통하므로 무선 경험을 할 수 있습니다. 첫째, "학습하기"를 통해 구체적인 제스처를 학습하고 모델을 다운로드합니다. 둘째, 저장된 모델에 .tflite 확장자를 로드하고 "전송" 버튼을 클릭하여 모델을 ESP32s3 보드로 전송합니다.',
        stepOne : "1. Kit 모델 확인",
        stepOneDesc: "키트에 해당 예제와 호환되는 모델이 저장되어 있는지 확인하는 과정입니다. 모델이 저장되어있다면, 저장된 모델로 아래의 과정을 생략하고 예제를 바로 체험할 수 있습니다. 모델의 유무와 상관없이 새로운 모델을 선택하여 전송하고 예제를 체험할 수 있습니다.",
        stepTwo : "2. 모델 선택",
        stepTwoDesc : "원하는 모델을 선택할 수 있습니다. PC로부터 업로드 또는 메모리에 내장되어있는 TinyML예제 모델을 선택할 수 있습니다.",
        stepThree : "3. 전송",
        stepThreeDesc : "선택한 모델을 Kit로 보냅니다. 전송이 완료되면 예제를 체험할 수 있습니다.",
        btnStart : "시작",
        btnApp : "TinyML예제 체험하기",
        btnModel : "모델 선택",
        btnAppModel : "TinyML예제 모델 선택",
        btnSend : "전송",
        finStart : "호환되는 모델이 있습니다.",
        errorStart : "호환되는 모델이 없습니다.",
        finSelect : "호환되는 모델을 선택하였습니다.",
        errorSelect : "호환되지 않는 모델입니다. 다시 선택해주세요.",
        finSend : "전송이 완료되었습니다."
    }
</script>

<AppMain bannerTitle={strAsset.bannerTitle} appName="mole">
    <div class="model-choose-container">
        <Description
            title={strAsset.selectTitle}
            explanation={strAsset.selectDesc}
        />
        <div class="confirm-model-container">
            <h2>{strAsset.stepOne}</h2>
            <p class="desc">{strAsset.stepOneDesc}</p>
            <div class="btn-container row">
                <button class="btn-start btn-stroke" on:click={handleSendModelInterface$1}>{strAsset.btnStart}</button>
                {#if isStart === true}
                    <p class="fin-txt">{strAsset.finStart}</p>
                {:else if isErrorStart === true}
                    <p class="error-txt">{strAsset.errorStart}</p>
                {/if}
                <button class="btn-app btn-fill" disabled>
                    <img src="#"/>{strAsset.btnApp}</button>
                    
            </div>
            <div id="myProgress" hidden>
                <div id="myBar"></div>
            </div>
        </div>
        <div class="choose-model-container">
            <h2>{strAsset.stepTwo}</h2>
            <p class="desc">{strAsset.stepTwoDesc}</p>
            <div class="btn-container row">
                <button class="btn-select-model btn-stroke" on:click={handleButtonClick}>{strAsset.btnModel}</button>
                <input type="file" style="display: none;" bind:this={fileInput$1} on:change={handleFileChange}/>
                <select class="btn-ex btn-stroke" name="model">
                    <option value="default">{strAsset.btnAppModel}</option>
                    <option value="one">1</option>
                    <option value="two">2</option>
                    <option value="three">3</option>
                    <option value="four">4</option>

                </select>
                {#if isSelect === true}
                    <p class="fin-txt">{strAsset.finSelect}</p>
                {:else if isErrorSelect === true}
                    <p class="error-txt">{strAsset.errorSelect}</p>
                {/if}
            </div>
        </div>
        <div class="send-model-container">
            <h2>{strAsset.stepThree}</h2>
            <p class="desc">{strAsset.stepThreeDesc}</p>
            <div class="btn-container row">
                <button class="btn-send btn-stroke" on:click={handleSendModelInterface}>{strAsset.btnSend}</button>
                {#if isSend === true}
                <p class="fin-txt">{strAsset.finSend}</p>
                {/if}
            </div>
            <div class="myProgress" hidden>
                <div class="myBar"></div>
            </div>
        </div>
    </div>
</AppMain>

<style lang="scss">
    @import "@scss/vars";

    .desc {        
        margin-bottom: 50px;
    }
    .btn-container {
        margin-bottom: 36px;
    }
    .btn-app {
        margin-left: auto;
    }
    .confirm-model-container,
    .choose-model-container,
    .send-model-container {
        margin-bottom: 118px;
    }
    .btn-select-model {
        margin-right: 24px;
    }
    .fin-txt{
        margin-left: 12px;
        color: $color-deepblue;
    }
    .error-txt{
        margin-left: 12px;
        color: red;
    }
</style>
