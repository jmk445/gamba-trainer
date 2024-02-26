<script>
    import Prompt from "./Prompt.svelte";
    import FlowChart from "@assets/img/flow_chart.png";
    import Outline from "@assets/img/outline.png";
    export let onClose = () => {};
    let pageNum = "outline";
    
    const strAsset={
        btnOutline : "개요",
        btnFlow : "흐름도",
        outTitle : '"AI 학습" 교육 플랫폼',
        outDescOne : "인공지능 입문자가 AI 학습과정을 쉽게 배울 수 있도록 돕는 온라인 학습 플랫폼입니다.",
        outDescTwo : "무선 연결을 통해 TinyML 키트와 플랫폼을 연결합니다. 사용자는 키트를 사용하여 데이터를 수집할 수 있습니다. 이 수집된 데이터를 기반으로 머신러닝 모델을 학습시킵니다. 학습된 모델을 사용자가 직접 경험할 수 있도록 지원합니다.",
        flowOneTitle : "트레이너",
        flowOneDesc_one : "해당 플랫폼에는 모션(모션 센서), 소리&음성(마이크 센서), 이미지(카메라 센서) 트레이너가 있습니다. 사용자는 이 중 하나의 트레이너를 선택하여 학습을 진행할 수 있습니다.",
        flowOneDesc_two: '"새로운 모델 학습" 모드에서는 사용자가 AI 모델을 자유롭게 학습시킬 수 있습니다.',
        flowOneDesc_three : '"예제용 모델 학습" 모드에서는 선택한 예제와 호환되는 AI 모델을 학습한 후 해당 예제를 체험해볼 수 있습니다.',
        flowTwoTitle : "TinyML 예제",
        flowTwoDesc : "원하는 예제를 선택 후 체험합니다. “예제용 모델 학습” 모드에서 학습된 모델 또는 내장되어있는 모델을 이용하여 체험할 수 있습니다."
    }
</script>

<Prompt title="개요" closePrompt={onClose}>
    <div class="inner">
        <div class="btn-container">
            <button
                class="btn-nav"
                class:active={pageNum === "outline"}
                on:click={() => (pageNum = "outline")}>{strAsset.btnOutline}</button
            >
            <button
                class="btn-nav"
                class:active={pageNum === "flow"}
                on:click={() => (pageNum = "flow")}>{strAsset.btnFlow}</button
            >
        </div>
        {#if pageNum === "outline"}
            <div class="desc-container">
                <div class="desc">
                    <h1>{strAsset.outTitle}</h1>
                    <div class="section-desc">
                        <p>{strAsset.outDescOne}</p>
                    </div>
                    <p>{strAsset.outDescTwo}</p>
                </div>
            </div>
            <div><img class="img-outline" src={Outline} alt="개요" /></div>
        {:else if pageNum === "flow"}
            <div class="desc-container">
                <div class="desc">
                    <h1>{strAsset.flowOneTitle}</h1>
                    <div class="section-desc">
                        <p>{strAsset.flowOneDesc_one}</p>
                    </div>
                    <div class="section-desc">
                        <p>{strAsset.flowOneDesc_two}</p>
                        <p>{strAsset.flowOneDesc_three}</p>
                    </div>
                </div>
                <div class="desc">
                    <h1>{strAsset.flowTwoTitle}</h1>
                    <div class="section-desc">
                        <p>{strAsset.flowTwoDesc}</p>
                    </div>
                </div>
            </div>
            <div><img class="img-flow" src={FlowChart} alt="흐름도" /></div>
        {/if}
    </div>
</Prompt>

<style lang="scss">
    @import "@scss/vars";

    .inner {
        overflow: scroll;
        overflow-x: hidden;
        position: relative;
        // text-align: center;
        z-index: 1;
        max-width: 1132px;
        max-height: 580px;
        padding: 18px 92px;
    }
    .btn-container {
        margin-bottom: 36px;
    }
    .btn-nav {
        background-color: $color-nav-gray;
        color: black;
        border-radius: 100px;
        padding: 12px 48px;
        &:active {
            background-color: $color-nav-blue;
            color: white;
        }
        &:first-child {
            margin-right: 12px;
        }
    }
    .active {
        background-color: $color-nav-blue;
        color: white;
    }
    .desc-container {
        margin-bottom: 72px;

        h1 {
            font-weight: 700;
            margin-bottom: 12px;
        }
        .desc {
            margin-bottom: 48px;
        }
        .section-desc {
            margin-bottom: 24px;
        }
    }
    .img-flow,
    .img-outline {
        width: 100%;
    }
</style>
