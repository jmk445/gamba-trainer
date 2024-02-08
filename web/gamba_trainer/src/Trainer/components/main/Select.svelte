<script>
    import SubBanner from "../../../components/common/SubBanner.svelte";
    import Footer from "../../../components/common/footer.svelte";

    import ShowSelectAppPrompt from "../../../components/general/prompts/SelectAppPrompt.svelte";
    import FloatingBtn from "../../../components/general/floating/floatingBtn.svelte";
    import PreparingPrompt from "../../../components/general/prompts/preparingPrompt.svelte";

    import icTrainer from "../../../assets/img/ic_trainer.svg";
    import persistStore from "../../stores/utils/persistStore";
    import { getTrainerADD } from "../../stores/actions";
    import { FromPixels } from "@tensorflow/tfjs";
    import { onMount } from "svelte";

    let showPreparing = false;
    let selectTrainerID = null;
    let selectModeID = null;
    let modeActive = "disabled";
    let isBtnDisabled = true;
    let showSelectApp = false;
    let trainer;
    export function clearPersistantStorage() {
        persistStore.clear();        
    }
    //trainerADD clear
    onMount(() => {        
        clearPersistantStorage();
    });

    function selectTrainer(id) {
        selectTrainerID = id;
        modeActive = "";
    }

    function selectMode(id) {
        selectModeID = id;
        isBtnDisabled = false;
        // console.log(selectModeID);
    }

    function goToTrainer() {
        // console.log(selectTrainerID, selectModeID);
        if (selectTrainerID === "motion" && selectModeID === "basicMode") {
            persistStore("trainerADD!", "motion");
            window.location.href = "/motion-start";
        }
        if (selectTrainerID === "speech" && selectModeID === "basicMode") {            
            persistStore("trainerADD!", "speech");
            window.location.href = "/speech-start";
        }
        if (selectTrainerID === "vision" && selectModeID === "basicMode") {
            // window.location.href = "/vision-settings";
            // alert("vision, basic");
            showPreparing = true;
        }
        if (selectTrainerID === "motion" && selectModeID === "appMode") {
            console.log("0 : 버튼 클릭함수 실행")
            setTrainerADD().then(()=>{
                console.log("3 : trainer값 얻음");
                window.location.href = `${trainer}-start`;
                console.log("appmode-fui : ", trainer);
            });
            
            
            
        }
        if (selectTrainerID === "speech" && selectModeID === "appMode") {
            // console.log(selectTrainerID, selectModeID);
            // alert("sppech, app");
            showPreparing = true;
        }
        if (selectTrainerID === "vision" && selectModeID === "appMode") {
            // console.log(selectTrainerID, selectModeID);
            // alert("vision, app");
            showPreparing = true;
        }
    }
    async function setTrainerADD(){
        console.log("1 : setTrainerADD함수 실행");
        trainer = await getTrainerADD();
        
        return trainer;
    }
    const strAsset = {
        bannerTitle: "트레이너",
        pageDesc:
            "데이터를 수집하고 모델을 학습한 후 마이크로컨트롤러용 텐서플로우 라이트로 구동되는 ESP32-S3 보드에 업로드합니다.",
        typeTrainer: "트레이너 선택",
        trainerOne: "모션",
        trainerTwo: "소리&음성",
        trainerThree: "이미지",
        typeMode: "모드 선택",
        modeOneType: "트레이너 ",
        modeOne: "새로운 모델 학습하기",
        modeOneCaption:
            "나만의 새로운 인공지능 모델을 훈련시키는 과정을 체험해보세요",
        modeTwoType: "트레이너 + TinyML 예제",
        modeTwo: "예제용 모델 학습하기", 
        modeTwoCaption:
            "TinyML예제에 호환되도록 모델을 학습시켜 활용 및 체험해보세요",
        btnGoToTrainer: "트레이너 시작",
    };
</script>

<header>
    <SubBanner
        title={strAsset.bannerTitle}
        icTitle={icTrainer}
        altTxt="트레이너 아이콘"
    />
</header>

<main class="select section">
    <div class="caption">
        <p>{strAsset.pageDesc}</p>
    </div>

    <div class="contents trainer">
        <h1>{strAsset.typeTrainer}</h1>

        <div class="select-container">
            <div class="trainer-container">
                <input
                    type="radio"
                    name="trainer"
                    value="moiton"
                    id="motionTrainer"
                    on:click={() => selectTrainer("motion")}
                />
                <label for="motionTrainer">
                    <p>{strAsset.trainerOne}</p>
                </label>
            </div>
            <div class="trainer-container">
                <input
                    type="radio"
                    name="trainer"
                    value="speech"
                    id="speechTrainer"
                    on:click={() => selectTrainer("speech")}
                />
                <label for="speechTrainer">
                    <p>{strAsset.trainerTwo}</p>
                </label>
            </div>
            <div class="trainer-container">
                <input
                    type="radio"
                    name="trainer"
                    value="vision"
                    id="visionTrainer"
                    on:click={() => selectTrainer("vision")}
                />
                <label for="visionTrainer">
                    <p>{strAsset.trainerThree}</p>
                </label>
            </div>
        </div>
    </div>
    <div class="contents {modeActive}" id="modeDisabled">
        <h1>{strAsset.typeMode}</h1>

        <div class="select-container">
            <div class="mode-container">
                <input
                    type="radio"
                    name="mode"
                    value="basic"
                    id="basicMode"
                    on:click={() => selectMode("basicMode")}
                />
                <label for="basicMode">
                    <span>{strAsset.modeOneType}</span>
                    <p class="mode-title">{strAsset.modeOne}</p>
                    <p>{strAsset.modeOneCaption}</p>
                </label>
            </div>
            <div class="mode-container">
                <input
                    type="radio"
                    name="mode"
                    value="app"
                    id="appMode"
                    on:click={() => {
                        selectMode("appMode");
                        showSelectApp = true;
                    }}
                />
                <label for="appMode">
                    <span>{strAsset.modeTwoType}</span>
                    <p class="mode-title">{strAsset.modeTwo}</p>
                    <p>{strAsset.modeTwoCaption}</p>
                </label>
            </div>
        </div>
    </div>
    <div class="btn-move-wrap contents">
        <button class="btn-fill" disabled={isBtnDisabled} on:click={goToTrainer}
            >{strAsset.btnGoToTrainer}</button
            >
    </div>
</main>
<footer>
    <Footer />
</footer>
{#if showSelectApp === true}
    <ShowSelectAppPrompt
        onClose={() => (showSelectApp = false)}
        trainer={selectTrainerID}
    />
{/if}
<FloatingBtn/>
{#if showPreparing}
    <PreparingPrompt onClose={()=>showPreparing = false}/>
{/if}
<style lang="scss">
    @import "@scss/vars";
    
    input[type="radio"] {
        display: none;
    }
    input[type="radio"]:checked + label {
    background-color: $color-select-blue;
    color: white;
    }
    .caption {
        margin: 32px 0 72px 0;
    }
    .select {
        display: flex;
        flex-direction: column;

        &:last-child {
            align-items: center;
        }
        .contents {
            // margin-bottom: 12px;
    
            h1 {
                font-size: 2.25rem;
                margin-bottom: 32px;
                font-weight: 700;
            }
        }
    }
    
    .select-container {
        display: flex;
        flex-direction: row;
        gap: 2%;
        
        &>div{
            flex: 1;
        }
        label {
            box-sizing: border-box;
            display: inline-block;
            background-color: white;
            border: 2px solid $color-select-blue;
            border-radius: 8px;
            width: 100%;
            text-align: center;
            cursor: pointer;
            margin: 0;
            
            text-align: center;
            color: black;
            font-weight: 400;
            &:hover {
                background-color: $color-lightsky;
                color: black;
            }
        }
        .trainer-container label {
            padding: 20px 0;
            font-size: 2rem;
        }
        .mode-container label {
            padding: 24px 24px;
            min-height: 264px;
            span {
                display: flex;
                justify-content: flex-end;
                font-size: 0.875rem;
            }
            .mode-title {
                font-size: 3rem;
                margin: 64px 0 12px 0;
                line-height: 100%;
            }
        }
    }

    .btn-move-wrap {
        align-items: center;
        button {
            max-width: 200px;
        }
    }
    .disabled {
        pointer-events: none;
        opacity: 0.4;
    }
</style>
