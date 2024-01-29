<script>
    import { Link } from "svelte-routing";
    import Description from "../../common/Description.svelte";
    import arrowRight from "@assets/icons/arrow_right.png";
    import { pushPropmt } from "../src_motion/stores/ui/actions";
    import { trainedModel } from "../src_motion/stores/train/store";
    import {
        convertToTflite,
        downloadTfliteModel
    } from "../src_motion/stores/aggregatedActions"
    let downloadOption = "arduino"; // || 'tfjs'
    let quantize = false;
    let isDownloading = false;
    let isConverting = false;
    let isbtnDisabled = true;
    async function handleConvert(quantize){
        isConverting = true;        
        await convertToTflite(quantize)    
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
        convertTitle : "모델 변환 및 전송",
        convertDesc : '학습된 모델을 .tflite 확장자 모델로 변환 후 키트에 전송합니다. 원하는 경우 모델을 다운로드할 수 있습니다. "예제용 모델 만들기"로 시작했다면 "예제에서 체험" 이동 버튼이 활성화됩니다.',
        btnconvert : "변환",
        btnSend : "전송",
        btnDownload : "다운로드",
        btnapp : "예제에서 체험"
    }
</script>

<div class="contents">
    <Description
        title={strAsset.convertTitle}
        explanation={strAsset.convertDesc}/>
    <div class="progress-container">
        <div class="btn-container">            
            <button class="btn-convert btn-stroke" disabled={isConverting} on:click={() => {handleConvert(false);}}>{strAsset.btnconvert}</button>
            <button class="btn-send btn-stroke" disabled>{strAsset.btnSend}</button>
            <button class="btn-download btn-stroke" disabled={!$trainedModel || isDownloading}  on:click={() => handleDownload()}>{strAsset.btnDownload}</button>
        </div>
        <div class="myProgress">
            <div class="myBar"></div>
        </div>
    </div>
    <div class="move-page">
        <button class="btn-app btn-fill" disabled={isbtnDisabled}>
            <img src={arrowRight} alt="arrow" /> {strAsset.btnapp}</button>
        <!-- <Link to="/">
            <button class="btn-home button">
                <img src={arrowRight} alt="arrow" />메인으로 돌아가기
            </button>
        </Link> -->
    </div>
</div>

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