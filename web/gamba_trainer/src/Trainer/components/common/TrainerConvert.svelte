<script>    
    import Description from "../../../components/common/Description.svelte";
    import FloatingBtn from "../../../components/general/floating/floatingBtn.svelte";

    const strAsset = {
        convertTitle : "모델 변환 및 전송",
        convertDesc : '학습된 모델을 .tflite 확장자 모델로 변환 후 키트에 전송합니다. 원하는 경우 모델을 다운로드할 수 있습니다. "예제용 모델 만들기"로 시작했다면 "예제에서 체험" 이동 버튼이 활성화됩니다.'
    }
</script>

<div class="contents">
    <Description
        title={strAsset.convertTitle}
        explanation={strAsset.convertDesc}/>
        <slot name="convert-send"/>   
</div>
<FloatingBtn/>