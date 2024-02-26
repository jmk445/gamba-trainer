<script>
    import { Link } from "svelte-routing";
    import icArrowBlack from "@assets/img/ic_arrow_black.svg";
    import icArrowWhite from "@assets/img/ic_arrow_white.svg";
    import TrainerConvert from "../../../components/common/TrainerConvert.svelte";
    // import { pushPropmt } from "../src_motion/stores/ui/actions";
    import { trainedModel } from "../../stores/ui/actions";
    import { onMount } from "svelte";
    import {
        convertToTflite,
        downloadTfliteModel,
    } from "../../stores/aggregatedActions";
    import {
        handleSendModel,
        handleFileInput,
        handleCheckModel,
    } from "../../../../Application/FUI/stores/tf4micro-motion-kit-v2";
    import { navigate } from "svelte-routing";
    import { getTrainerADD } from "../../../stores/actions";
    let downloadOption = "arduino";
    let quantize = false;
    let isDownloading = false;
    let isConverting = false;
    let isbtnDisabled = false;
    let isApplicationMode = false;
    //문구 등장 변수
    let isConverted = false;
    let isSend = false;
    let trainer;
    async function handleConvert(quantize) {
        isConverting = true;
        trainer = await getTrainerADD();
        console.log(trainer);
        await convertToTflite(quantize, trainer);
        isConverting = false;
        isConverted = true;
        alert("convert done");
    }
    onMount(async () => {
        trainer = await getTrainerADD();
        console.log("주소는 : ", trainer);
        if (trainer === "FUI") {
            isApplicationMode = true;
        }
    });
    //quantize 구현해야 됨.
    async function handleDownload() {
        isDownloading = true;
        await downloadTfliteModel(quantize);
        isDownloading = false;
    }

    function handleSendInterface() {
        handleSendModel();
    }

    const strAsset = {
        btnconvert: "변환",
        btnSend: "전송",
        btnDownload: "다운로드",
        btnApp_one: "TinyML예제에서 체험",
        btnApp_two: "TinyML예제로 이동",
        finConvert: "변환이 완료되었습니다.",
        finSend: "전송이 완료되었습니다.",
    };
</script>

<TrainerConvert>
    <div slot="convert-send">
        <div class="progress-container">
            <div class="btn-container row">
                <button
                    class="btn-convert btn-stroke"
                    disabled={isConverting}
                    on:click={() => {
                        handleConvert(false);
                    }}>{strAsset.btnconvert}</button
                >
                <button
                    class="btn-send btn-stroke"
                    on:click={handleSendInterface()}>{strAsset.btnSend}</button
                >
                {#if isConverted === true}
                    <p class="fin-txt">{strAsset.finConvert}</p>
                {:else if isSend === true}
                    <p class="fin-txt">{strAsset.finSend}</p>
                {/if}
                <button
                    class="btn-download btn-stroke"
                    on:click={() => handleDownload()}
                    >{strAsset.btnDownload}</button
                >
            </div>
            <div class="myProgress">
                <!-- @todo -->
                <div class="myBar"></div>
            </div>
        </div>
        <div class="move-page">
            {#if isApplicationMode}
                <Link to="/fui-experience">
                    <button class="btn-app btn-fill" disabled={isbtnDisabled}>
                        {#if isbtnDisabled}
                            <img src={icArrowBlack} alt="arrow" />
                        {:else if !isbtnDisabled}
                            <img src={icArrowWhite} alt="arrow" />
                        {/if}
                        {strAsset.btnApp_one}
                    </button>
                </Link>
            {:else if !isApplicationMode}
                <Link to="/motionApps-select">
                    <button class="btn-app btn-fill" disabled={isbtnDisabled}>
                        {#if isbtnDisabled}
                            <img src={icArrowBlack} alt="arrow" />
                        {:else if !isbtnDisabled}
                            <img src={icArrowWhite} alt="arrow" />
                        {/if}
                        {strAsset.btnApp_two}
                    </button>
                </Link>
            {/if}
        </div>
    </div>
</TrainerConvert>

<style lang="scss">
    @import "@scss/vars";

    .btn-container {
        margin-bottom: 12px;
    }
    .btn-download,
    .btn-app {
        float: right;
        margin-left: auto;
    }
    .btn-convert {
        margin-right: 24px;
    }
    .progress-container {
        margin-bottom: 128px;
    }
    .fin-txt {
        color: $color-deepblue;
        margin-left: 12px;
    }
    .btn-app {
        display: flex;
        margin-left: 12px;
    }
    img {
        margin-right: 12px;
    }
</style>
