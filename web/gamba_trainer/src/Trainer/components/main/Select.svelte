<script>
    import SubBanner from "../../../common/SubBanner.svelte";
    import Footer from "../../../common/footer.svelte";
    let selectTrainerID = null;
    let selectModeID = null;
    let modeActive = "disabled";
    let isBtnDisabled = true;

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
        console.log(selectTrainerID, selectModeID);
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
    }
</script>

<header>
    <SubBanner title="Trainer" />
</header>

<main class="select section">
    <div class="caption">
        <p>
            데이터를 캡처하고 모델을 학습한 후 마이크로컨트롤러용 텐서플로우
            라이트로 구동되는 ESP32-S3 보드에 업로드합니다.
        </p>
    </div>

    <div class="choose-container trainer">
        <h1>트레이너 선택</h1>

        <div class="trainer-container">
            <div class="trainer-wrap">
                <input type="radio" name="trainer" value="moiton" id="motionTrainer"
                    on:click={() => selectTrainer("motionTrainer")}/>
                <label for="motionTrainer">
                    <p>Motion Trainer</p>
                </label>
            </div>
            <div class="trainer-wrap">
                <input
                    type="radio" name="trainer" value="speech" id="speechTrainer"
                    on:click={() => selectTrainer("speechTrainer")} />
                <label for="speechTrainer">
                    <p>Speech Trainer</p>
                </label>
            </div>
            <div class="trainer-wrap">
                <input
                    type="radio" name="trainer" value="vision" id="visionTrainer"
                    on:click={() => selectTrainer("visionTrainer")}/>
                <label for="visionTrainer">
                    <p>Vision Trainer</p>
                </label>
            </div>
        </div>
    </div>
    <div class="choose-container {modeActive}" id="modeDisabled">
        <h1>모드 선택</h1>

        <div class="mode-container">
            <div class="contents-container">
                <input type="radio" name="mode" value="basic" id="basicMode"
                    on:click={() => selectMode("basicMode")}/>
                <label for="basicMode">
                    <span>트레이닝</span>
                    <span
                        >나만의 새로운 인공지능 모델을 훈련시키는 과정을
                        체험해보세요</span
                    >
                    <p class="mode-title">Basic Mode</p>
                </label>
            </div>
            <div class="contents-container">
                <input type="radio" name="mode" value="app" id="appMode"
                    on:click={() => selectMode("appMode")}/>
                <label for="appMode">
                    <span>트레이닝+어플리케이션</span>
                    <span
                        >어플리케이션에 호환되도록 모델을 학습시켜 활용 및
                        체험해보세요</span
                    >
                    <p class="mode-title">Application Mode</p>
                </label>
            </div>
        </div>
    </div>
    <div class="btn-move-wrap">
        <button class="button" disabled={isBtnDisabled} on:click={goToTrainer}>Go to Trainer</button>
    </div>
</main>
<footer>
    <Footer />
</footer>

<style lang="scss">
    @import "@scss/vars";

    .caption {
        margin: 57px 0;
    }   
    .select {
        display: flex;
        flex-direction: column;

        &:last-child {
            align-items: center;
        }
    }
    .choose-container {
        margin-bottom: 12px;

        h1 {
            margin-bottom: 51px;
        }
    }
    .trainer {
        margin-bottom: 136px;
    }
    input[type="radio"] {
        display: none;
    }
    .contents-container, .trainer-wrap {
        flex: 1;
    }
    .trainer-container {
        display: flex;
        flex-direction: row;
        gap: 6%;

        .trainer-wrap label {
            box-sizing: border-box;
            display: inline-block;
            background-color: $color-btn-blue;
            border-radius: 8px;
            width: 100%;
            padding: 22px 46px;
            cursor: pointer;
            margin: 0;
            font-size: 2rem;
            text-align: center;
            color: white;

            &:hover {
                color: white;
            }
        }
    }
    .mode-container {
        display: flex;
        flex-direction: column;
    }
    .contents-container label {
        display: block;
        background-color: $color-lightsky;
        border-radius: 8px;
        padding: 22px 46px;
        margin-bottom: 51px;
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
    }
    input[type="radio"]:checked + label {
        background-color: #000000;
        color: white;
    }
    .mode-title {
        font-size: 3rem;
        margin: 47px 0 0 81px;
        line-height: 100%;
    }

    .btn-move-wrap {
        text-align: center;
        margin-bottom: 42px;
    }
    // .button:disabled {
    //     background-color: #dbdbdb;
    // }
    .disabled {
        pointer-events: none;
        opacity: 0.4;
    }
</style>
