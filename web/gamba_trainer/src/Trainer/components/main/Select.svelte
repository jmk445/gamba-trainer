<script>
    import SubBanner from "../../../common/SubBanner.svelte";
    import Footer from "../../../common/footer.svelte";
    import ShowSelectAppPrompt from "../../../general/prompts/SelectAppPrompt.svelte";
    let selectTrainerID = null;
    let selectModeID = null;
    let modeActive = "disabled";
    let isBtnDisabled = true;
    let showSelectApp = false;
    let trainer
    function selectTrainer(id) {
        selectTrainerID = id;
        modeActive = "";
        // console.log(selectTrainerID);
    }

    function selectMode(id) {
        selectModeID = id;
        isBtnDisabled = false;
        // console.log(selectModeID);
    }

    function goToTrainer() {
        // console.log(selectTrainerID, selectModeID);
        if ( selectTrainerID === "motionTrainer" && selectModeID === "basicMode" ) {
            window.location.href = "/motion-settings";
        }
        if ( selectTrainerID === "speechTrainer" && selectModeID === "basicMode" ) {
            // window.location.href = "/speech-settings";
            alert("speech, basic");
        }
        if ( selectTrainerID === "visionTrainer" && selectModeID === "basicMode" ) {
            // window.location.href = "/vision-settings";
            alert("vision, basic");
        }
        if ( selectTrainerID === "motionTrainer" && selectModeID === "appMode" ) {
            // console.log(selectTrainerID, selectModeID);
            alert("motion, app");
        }
        if ( selectTrainerID === "speechTrainer" && selectModeID === "appMode" ) {
            // console.log(selectTrainerID, selectModeID);
            alert("sppech, app");
        }
        if ( selectTrainerID === "visionTrainer" && selectModeID === "appMode" ) {
            // console.log(selectTrainerID, selectModeID);
            alert("vision, app");
        }
        // if(selectModeID === "appMode"){
        //     showSelectApp = true;
        // }
    }

    const strAsset = {
        bannerTitle : "트레이너", 
        pageDesc: "데이터를 캡처하고 모델을 학습한 후 마이크로컨트롤러용 텐서플로우 라이트로 구동되는 ESP32-S3 보드에 업로드합니다.",
        typeTrainer : "트레이너 선택",
        trainerOne : "모션",
        trainerTwo : "소리&음성",
        trainerThree : "이미지",
        typeModel : "모드 선택",
        modelOne : "새로운 모델 만들기",
        modelTwo : "예제용 모델 만들기",
        modelOneType : "트레이닝",
        modelTwoType : "트레이닝 + 어플리케이션",
        modelOneCaption : "나만의 새로운 인공지능 모델을 훈련시키는 과정을 체험해보세요",
        modelTwoCaption : "어플리케이션에 호환되도록 모델을 학습시켜 활용 및 체험해보세요",
        btnGoToTrainer : "트레이너 시작"

    }
</script>

<header>
    <SubBanner title={strAsset.bannerTitle} />
</header>

<main class="select section">
    <div class="caption">
        <p>{strAsset.pageDesc}</p>
    </div>

    <div class="contents trainer">
        <h1>{strAsset.typeTrainer}</h1>

        <div class="trainer-container">
            <div class="trainer-wrap">
                <input type="radio" name="trainer" value="moiton" id="motionTrainer"
                    on:click={() => selectTrainer("motionTrainer")}/>
                <label for="motionTrainer">
                    <p>{strAsset.trainerOne}</p>
                </label>
            </div>
            <div class="trainer-wrap">
                <input
                    type="radio" name="trainer" value="speech" id="speechTrainer"
                    on:click={() => selectTrainer("speechTrainer")} />
                <label for="speechTrainer">
                    <p>{strAsset.trainerTwo}</p>
                </label>
            </div>
            <div class="trainer-wrap">
                <input
                    type="radio" name="trainer" value="vision" id="visionTrainer"
                    on:click={() => selectTrainer("visionTrainer")}/>
                <label for="visionTrainer">
                    <p>{strAsset.trainerThree}</p>
                </label>
            </div>
        </div>
    </div>
    <div class="contents {modeActive}" id="modeDisabled">
        <h1>{strAsset.typeModel}</h1>

        <div class="mode-container">
            <div class="contents-container">
                <input type="radio" name="mode" value="basic" id="basicMode"
                    on:click={() => selectMode("basicMode")}/>
                <label for="basicMode">
                    <span>{strAsset.modelOneType}</span>
                    <span>{strAsset.modelOneCaption}</span>
                    <p class="mode-title">{strAsset.modelOne}</p>
                </label>
            </div>
            <div class="contents-container">
                <input type="radio" name="mode" value="app" id="appMode"
                    on:click={() => {
                        selectMode("appMode");
                        showSelectApp = true;}}/>
                <label for="appMode">
                    <span>{strAsset.modelTwoType}</span>
                    <span>{strAsset.modelTwoCaption}</span>
                    <p class="mode-title">{strAsset.modelTwo}</p>
                </label>
            </div>
        </div>
    </div>
    <div class="btn-move-wrap contents">
        <button class="button" disabled={isBtnDisabled} on:click={goToTrainer}>{strAsset.btnGoToTrainer}</button>
    </div>
</main>
<footer>
    <Footer />
</footer>
{#if showSelectApp === true}
<ShowSelectAppPrompt  onClose={() => (showSelectApp = false)} trainer={selectTrainerID}/>
    {/if}
<style lang="scss">
    @import "@scss/vars";

    .caption {
        margin: 32px 0 72PX 0;
    }   
    .select {
        display: flex;
        flex-direction: column;

        &:last-child {
            align-items: center;
        }
    }
    .contents {
        // margin-bottom: 12px;

        h1 {
            font-size: 2.25rem;
            margin-bottom: 32px;
            font-weight: 700;
        }
    }
    // .trainer {
    //     margin-bottom: 136px;
    // }
    input[type="radio"] {
        display: none;
    }
    .contents-container, .trainer-wrap {
        flex: 1;
    }
    .trainer-container {
        display: flex;
        flex-direction: row;
        gap: 2%;

        .trainer-wrap label {
            box-sizing: border-box;
            display: inline-block;
            background-color: $color-btn-blue;
            border-radius: 8px;
            width: 100%;
            padding: 20px 0;
            cursor: pointer;
            margin: 0;
            font-size: 2rem;
            text-align: center;
            color: white;
            font-weight: 400;
            &:hover {
                color: white;
            }
        }
    }
    .mode-container {
        display: flex;
        flex-direction: column;
    }

.contents-container {
    &:first-child{
     margin-bottom: 24px;
    }
    label {
        display: block;
        background-color: $color-lightsky;
        border-radius: 8px;
        padding: 20px 20px;
        cursor: pointer;

        span:first-child {
            font-size: 0.875rem;
        }
        span:nth-child(2) {
            float: right;
        }
        &:hover {
            color: white;
        }
        .mode-title {
            font-size: 3rem;
            margin: 32px 0 0 0;
            line-height: 100%;
        }
    }
}
    
    input[type="radio"]:checked + label {
        background-color: #000000;
        color: white;
    }


    .btn-move-wrap {
        align-items: center;
        button{
            max-width: 200px;
        }
    }
    .disabled {
        pointer-events: none;
        opacity: 0.4;
    }
</style>