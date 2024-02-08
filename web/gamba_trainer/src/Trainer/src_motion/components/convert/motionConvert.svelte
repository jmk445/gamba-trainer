<script>
    import arrowRight from "@assets/icons/arrow_right.png";
    import TrainerConvert from "../../../components/common/TrainerConvert.svelte";
    // import { pushPropmt } from "../src_motion/stores/ui/actions";
    import { trainedModel } from "../../stores/ui/actions";
    import {
        convertToTflite,
        downloadTfliteModel,
    } from "../../stores/aggregatedActions";
    let downloadOption = "arduino";
    let quantize = false;
    let isDownloading = false;
    let isConverting = false;
    let isbtnDisabled = true;
    //문구 등장 변수
    let isConvert = true;
    let isSend = false;

    async function handleConvert(quantize) {
        isConverting = true;
        await convertToTflite(quantize);
        isConverting = false;
        alert("convert done");
    }

    //quantize 구현해야 됨.
    async function handleDownload() {
        isDownloading = true;
        await downloadTfliteModel(quantize);
        isDownloading = false;
    }

    const strAsset = {
        btnconvert: "변환",
        btnSend: "전송",
        btnDownload: "다운로드",
        btnapp: "TinyML예제에서 체험",
        finConvert : "변환이 완료되었습니다.",
        finSend : "전송이 완료되었습니다."
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
                <button class="btn-send btn-stroke" disabled
                    >{strAsset.btnSend}</button
                >
                <!-- {#if isConvert === true} -->
                    <p class="fin-txt">{strAsset.finConvert}</p>
                <!-- {:else if isSend === true} -->
                    <!-- <p class="fin-txt">{strAsset.finSend}</p> -->
                <!-- {/if} -->
                <button
                class="btn-download btn-stroke"
                disabled={!$trainedModel || isDownloading}
                on:click={() => handleDownload()}>{strAsset.btnDownload}</button
            >

        </div>
        <div class="myProgress">
            <div class="myBar"></div>
        </div>
    </div>
    <div class="move-page">
        <button class="btn-app btn-fill" disabled={isbtnDisabled}>
            <img src={arrowRight} alt="arrow" /> {strAsset.btnapp}</button
        >
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
    .fin-txt{
        color: $color-deepblue;
        margin-left: 12px;
    }
    .btn-app {
        display: block;
        margin-left: 12px;
    }
    img {
        margin-right: 12px;
    }
</style>