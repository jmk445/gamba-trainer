<script>
    import { Link } from "svelte-routing";
    import {trainerADD} from "../../store/store"
    import SubBanner from "../../../common/SubBanner.svelte";
    import Footer from "../../../common/footer.svelte";
    import ShowSelectAppPrompt from "../../../general/prompts/SelectAppPrompt.svelte";
    import trainerIcon from "../../../assets/img/ic_trainer.svg"
    import { FromPixels } from "@tensorflow/tfjs";
    import { onMount } from "svelte";
    let selectTrainerID;
    let selectModeID;
    let modeActive = "disabled";
    let isBtnDisabled = true;
    let showSelectApp = false;
    let setADD;
    function selectTrainer(id) {
        selectTrainerID = id;
        modeActive = "";

    }

    function selectMode(id) {
        selectModeID = id;
        isBtnDisabled = false;
    }
    $: trainerADD.set(selectTrainerID + selectModeID);
    $:console.log($trainerADD);
onMount(()=>{
    console.log("select-trainerADD : "+$trainerADD);
});
    const strAsset = {
        bannerTitle: "트레이너",
        pageDesc:
            "데이터를 캡처하고 모델을 학습한 후 마이크로컨트롤러용 텐서플로우 라이트로 구동되는 ESP32-S3 보드에 업로드합니다.",
        typeTrainer: "트레이너 선택",
        trainerOne: "모션",
        trainerTwo: "소리&음성",
        trainerThree: "이미지",
        typeMode: "모드 선택",
        modeOne: "새로운 모델 만들기",
        modeTwo: "예제용 모델 만들기",
        modeOneType: "트레이너",
        modeTwoType: "트레이너 + TinyML 예제",
        modeOneCaption:
            "나만의 새로운 인공지능 모델을 훈련시키는 과정을 체험해보세요",
        modeTwoCaption:
            "TinyML예제에 호환되도록 모델을 학습시켜 활용 및 체험해보세요",
        btnGoToTrainer: "트레이너 시작",
    };
</script>

<header>
    <SubBanner title={strAsset.bannerTitle} titleIcon={trainerIcon} altTxt="트레이너 아이콘"/>
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
                    on:click={() => selectMode("")}
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
        {#if $trainerADD === "motion"}
        <Link to="/motion-settings">
        <button class="btn-fill" disabled={isBtnDisabled} 
            >{strAsset.btnGoToTrainer}</button
        >
    </Link>
    <!-- {:else if $trainerADD === "speech"}
    <Link to="/speech-settings">
        <button class="btn-fill" disabled={isBtnDisabled} 
            >{strAsset.btnGoToTrainer}</button
        >
    </Link> -->
    {:else}
    <Link to="/">
        <button class="btn-fill" disabled={isBtnDisabled} 
            >{strAsset.btnGoToTrainer}</button
        >
    </Link>
    {/if}
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

<style lang="scss">
    @import "@scss/vars";

    .caption {
        margin: 32px 0 72px 0;
    }
    .select {
        display: flex;
        flex-direction: column;

        &:last-child {
            align-items: center;
        }
    }
    h1 {
        font-size: 2.25rem;
        margin-bottom: 32px;
        font-weight: 700;
    }

    input[type="radio"] {
        display: none;
    }
    .mode-container,
    .trainer-container {
        flex: 1;
    }
    .select-container {
        display: flex;
        flex-direction: row;
        gap: 2%;

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

            color: black;
            font-weight: 400;
            &:hover {
                background-color: $color-lightsky;
            }
        }
    }
    .trainer-container label {
        padding: 20px 0;
        font-size: 2rem;
    }
    .mode-container label {
        padding: 24px;
        min-height: 264px;
        span {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            font-size: 0.875rem;
        }
        .mode-title {
            font-size: 3rem;
            margin: 64px 0 12px 0;
            line-height: 100%;
        }
    }
    .select-container {
        display: flex;
        flex-direction: row;
        gap: 2%;
    }

    input[type="radio"]:checked + label {
        border: 2px solid $color-btn-hover-blue;
        background-color: $color-btn-hover-blue;
        color: white;
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
