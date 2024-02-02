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
        btnapp: "예제에서 체험",
    };
</script>
<TrainerConvert>
<div slot="convert-send">
    <div class="progress-container">
        <div class="btn-container">
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
    .btn-container {
        margin-bottom: 12px;
    }
    .btn-download,
    .btn-app,
    .btn-home {
        float: right;
    }
    .btn-convert {
        margin-right: 24px;
    }
    .progress-container {
        margin-bottom: 128px;
    }
    .btn-move {
        margin-bottom: 16px;
    }
    .btn-app,
    .btn-home {
        display: block;
        margin-left: 12px;
    }
    img {
        margin-right: 12px;
    }
</style>