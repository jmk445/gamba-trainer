<script>
    import p5 from "./p5/index";
    import AppMain from "../components/common/AppMain.svelte";
    import AppDescription from "../components/common/appDescription.svelte";

    import left from "../components/asset/left.gif";
    import right from "../components/asset/right.gif";
    import pluck from "../components/asset/pluck.gif";
    import twirl from "../components/asset/twirl.gif";
    import poke from "../components/asset/poke.gif";

    import { onMount, onDestroy } from "svelte";
    import { getInferenceResult } from "./stores/tf4micro-motion-kit-v2";
    import { angle, countx, eSize } from "./p5/sketch";

    // let clickCount = -1;
    let sketchEl;
    function handleClick() {
        // countx = 0;
        // angle = 0;
        // eSize = 0;
        // if (clickCount === 4) {
        //     clickCount = 0;
        // } else {
        //     clickCount += 1;
        // }
        // p5.triggerGesture(clickCount);
    }

    let index;
    let interval;
    let index_before;

    onMount(() => {
        p5.setup(sketchEl);
        p5.triggerGesture(index);
        interval = setInterval(() => {
            index = getInferenceResult();
            // index_before = index;
            // if (index != index_before) {
            //     console.log("index changed!" + index);
            // }
            p5.triggerGesture(index);
        }, 100);
    });
    onDestroy(() => {
        p5.stopP5();
    });
    const strAsset = {
        explainTitle: "5가지의 제스처를 통해 눈동자의 움직임을 제어해보세요!",
        explainDesc:
            "보드를 손가락 뒤쪽(끝부분에 가까이)에 부착합니다. LED가 사용자를 향하고 USB 커넥터가 손목을 향하고 있는지 확인하세요.",
        numOne: "왼쪽",
        numTwo: "오른쪽",
        numThree: "돌리기",
        numFour: "퉁기기",
        numFive: "찌르기",
    };
</script>

<AppDescription
    appName="fui"
    explainTitle={strAsset.explainTitle}
    explainDesc={strAsset.explainDesc}
>
    <div slot="app-desc">
        <div class="gestures-container row">
            <div class="img-container">
                <img
                    src={left}
                    loading="lazy"
                    alt="left gesture"
                    class="image-6"
                />
                <p>{strAsset.numOne}</p>
            </div>
            <div class="img-container">
                <img
                    src={right}
                    loading="lazy"
                    alt="right gesture"
                    class="image-7"
                />
                <p>{strAsset.numTwo}</p>
            </div>
            <div class="img-container">
                <img
                    src={twirl}
                    loading="lazy"
                    alt="twirl gesture"
                    class="image-8"
                />
                <p>{strAsset.numThree}</p>
            </div>
            <div class="img-container">
                <img
                    src={pluck}
                    loading="lazy"
                    alt="pluck gesture"
                    class="image-9"
                />
                <p>{strAsset.numFour}</p>
            </div>
            <div class="img-container">
                <img
                    src={poke}
                    loading="lazy"
                    alt="poke gesture"
                    class="image-10"
                />
                <p>{strAsset.numFive}</p>
            </div>
        </div>
    </div>
    <div slot="content-container">
        <div bind:this={sketchEl} on:click={handleClick} class="p5-container" />
    </div>
</AppDescription>

<style lang="scss">
    .gestures-container {
        margin-top: 32px;
        .img-container {
            margin-right: 12px;
            font-size: 0.875rem;
            text-align: center;
            img {
                border-radius: 8px;
                width: 112px;
            }
        }
    }
    .p5-container {
        border-radius: 8px;
        height: calc(100vh - 100px);
    }
</style>
