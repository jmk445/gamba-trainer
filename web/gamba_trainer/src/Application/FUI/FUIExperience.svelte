<script>
    import p5 from "./p5/index";
    import AppMain from "../common/AppMain.svelte";

    import left from "../components/asset/left.gif";
    import right from "../components/asset/right.gif";
    import pluck from "../components/asset/pluck.gif";
    import twirl from "../components/asset/twirl.gif";
    import poke from "../components/asset/poke.gif";

    import { onMount } from "svelte";    
    import { getInferenceResult } from "./stores/tf4micro-motion-kit copy";

    let clickCount = -1;
    let sketchEl;
    function handleClick() {
        if (clickCount === 4) {
            clickCount = 0;
        } else {
            clickCount += 1;
        }
        p5.triggerGesture(clickCount);
        console.log("clickCount : " + clickCount);
    }
    //     $: if ($clickCount) {
    //     p5.triggerGesture($clickCount);
    //   }
    onMount(() => {
        p5.setup(sketchEl);
        console.log(clickCount);
    });

    let index;
    let interval;
    let index_before;

    onMount(() => {
        p5.triggerGesture(index);
        interval = setInterval(() => {
            index = getInferenceResult();            
            index_before = index;
            if (index != index_before) {
                console.log("index changed!" + index);
            }
            p5.triggerGesture(index);
        }, 500);
    });
</script>

<AppMain bannerTitle="FUI(Finger User Interface)" appName="fui">
    <div class="fui-explanation-container">
        <h2>5가지의 제스처:</h2>
        <ol>
            <li><p>Swipe left</p></li>
            <li><p>Swipe right</p></li>
            <li><p>Twirl (do so quickly!)</p></li>
            <li><p>Pluck (which changes the drum loop)</p></li>
            <li><p>Poke</p></li>
        </ol>
        <div class="img-gesture-container">
            <img
                src={left}
                loading="lazy"
                alt="left gesture"
                class="image-6"
            />
            <img
                src={left}
                loading="lazy"
                alt="right gesture"
                class="image-7"
            />
            <img
                src={twirl}
                loading="lazy"
                alt="twirl gesture"
                class="image-8"
            />
            <img
                src={pluck}
                loading="lazy"
                alt="pluck gesture"
                class="image-9"
            />
            <img
                src={poke}
                loading="lazy"
                alt="poke gesture"
                class="image-10"
            />
        </div>

        <p>
            보드를 손가락 뒤쪽(끝부분에 가까이)에 부착합니다. LED가 사용자를
            향하고 USB 커넥터가 손목을 향하고 있는지 확인합니다.
        </p>
    </div>
    <div bind:this={sketchEl} on:click={handleClick} class="p5-container" />
</AppMain>

<style lang="scss">
    @import "@scss/vars";

    .fui-explanation-container {
        background-color: $color-lightsky;
        border-radius: 8px;
        padding: 20px 102px;
        margin-bottom: 128px;
        ol {
            margin-bottom: 20px;
            padding: 16px;
            li{
                list-style-type: decimal;
            }
        }

        .img-gesture-container {
            display: flex;
            flex-direction: row;
            gap: 12px;
            margin-bottom: 20px;
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
