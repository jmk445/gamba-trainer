<script>
    import p5 from "./p5/index";
    import AppDescription from "../components/common/appDescription.svelte";


    import { onMount, onDestroy } from "svelte";
    import { getInferenceResult } from "./stores/tf4-micro-motion-kit.js";
    import { isAttack } from "./p5/sketch";

    let sketchEl;
    function handleClick(e) {
        isAttack = true;
        p5.triggerGesture(e);
    }
    let index;
    let interval;
    let index_before;
    
    onMount(() => {
        p5.setup(sketchEl);
        p5.triggerGesture(index);
        interval = setInterval(() => {
            // console.log(index_before);
            index_before = index;
            index = getInferenceResult();            
            // console.log(index);
            if (index != index_before) {
                console.log("index changed!" + index);
                if (index == 0) {
                    console.log(index + " detected");
                    handleClick("up");
                } else if (index == 1) {
                    console.log(index + " detected");
                    handleClick("down");
                } else if (index == 2) {
                    console.log(index + " detected");
                    handleClick("left");
                } else if (index == 3) {
                    console.log(index + " detected");
                    handleClick("right");
                }
            }
            
            // p5.triggerGesture(index);
            // console.log(index);
        }, 50);
    });
    onDestroy(() => {
        p5.stopP5();
    });
    
    const strAsset = {
        bannerTitle : "MOLE",
        explainTitle : "음성으로 두더지 게임을 즐겨보세요!",
        explainDesc : "두더지가 상하좌우 네 방향에서 등장합니다. 튀어나오는 두더지를 음성을 통해 잡아보세요. 발음이 정확하고 주변 소음이 없을수록 인식이 잘 됩니다.",
        molePos : "두더지 위치",
        molePos_One : "상",
        molePos_Two : "하",
        molePos_Three : "좌",
        molePos_Four : "우",
        index : "음성 명령어",
        index_One : "UP",
        index_Two : "DOWN",
        index_Three : "LEFT",
        index_Four : "RIGHT",
    }
</script>

<AppDescription appName="mole" explainTitle={strAsset.explainTitle} explainDesc={strAsset.explainDesc}>
    <div slot="app-desc">
        <table>
            <tr>
                <th>{strAsset.molePos}</th>
                <td>{strAsset.molePos_One}</td>
                <td>{strAsset.molePos_Two}</td>
                <td>{strAsset.molePos_Three}</td>
                <td>{strAsset.molePos_Four}</td>
            </tr>
            <tr>
                <th>{strAsset.index}</th>
                <td>{strAsset.index_One}</td>
                <td>{strAsset.index_Two}</td>
                <td>{strAsset.index_Three}</td>
                <td>{strAsset.index_Four}</td>
            </tr>
        </table>
    </div>
    <div slot="content-container">
        <div bind:this={sketchEl}  class="p5-container" />
        <!-- <button class="btn-stroke" on:click={()=>handleClick("left")}>left</button>
        <button class="btn-stroke" on:click={()=>handleClick("right")}>right</button>
        <button class="btn-stroke" on:click={()=>handleClick("up")}>up</button>
        <button class="btn-stroke" on:click={()=>handleClick("down")}>down</button> -->
    </div>
</AppDescription>
<style lang="scss">
    @import "@scss/vars";

    .p5-container {
        border-radius: 8px;
        height: calc(100vh - 100px);
    }
    table{
        width: 60%;
        border: 1px solid $color-lightsky;
        margin-top: 32px;
        text-align: center;
    }
    th{
        background-color: $color-nav-blue;
        color: white;
        font-weight: 400;
    }
    td{
        width: 20%;
        background-color: white;
    }
</style>
