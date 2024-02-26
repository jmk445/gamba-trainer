<script>
    import p5 from "./p5/index";
    import AppDescription from "../components/common/appDescription.svelte";

    import { onMount, onDestroy } from "svelte";
    import { getInferenceResult } from "./stores/tf4micro-motion-kit copy";
    import { masked, moveCount, h, move } from "./p5/sketch";

    let sketchEl;
    function handleClick() {
        // if (masked == false) {
        //     moveCount = 0;
        //     h = 360;
        // } else {
        //     h = 60;
        // }
        // move = !move;
        // masked = !masked;
    }

    let index;
    let interval;
    let index_before;

    onMount(() => {
        p5.setup(sketchEl);
        p5.triggerGesture(index);
        interval = setInterval(() => {
            index = getInferenceResult();
            if (index == 0) {
                // mask 쓴거
                move = false;
                masked = false;
            } else if (index == 1) {
                // mask 안쓴거
                masked = true;
                move = true;
            }
            // index_before = index;
            // if (index != index_before) {
            //     console.log("index changed!" + index);
            // }
            p5.triggerGesture(index);
        }, 500);
    });
    onDestroy(() => {
        p5.stopP5();
    });
    const strAsset = {
        bannerTitle: "MASK",
        explainTitle: "마스크를 쓰고 벗으면서 재밌는 경험을 해보세요!",
        explainDesc:
            "병균들이 여러분을 위혐하고 있어요. 마스크를 껴서 위험한 병균들로부터 자신을 보호하세요. 마스크를 가지고 있어야 해당 예제를 체험할 수 있습니다.",
    };
</script>

<AppDescription
    appName="mask"
    explainTitle={strAsset.explainTitle}
    explainDesc={strAsset.explainDesc}
>
    <div slot="app-desc"></div>
    <div slot="content-container">
        <div bind:this={sketchEl} on:click={handleClick} class="p5-container" />
    </div>
</AppDescription>

<style lang="scss">
    @import "@scss/vars";
    .p5-container {
        border-radius: 8px;
        height: calc(100vh - 100px);
    }
</style>
