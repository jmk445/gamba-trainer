<!--
Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

/**
* @author Rikard Lindstrom <rlindstrom@google.com>
*/
-->
<script>
    import { navigate } from "svelte-routing";
    import FloatingBtn from "../../../../components/general/floating/floatingBtn.svelte";
    import { onMount } from "svelte";
    // import NumberInput from "../../../../general/NumberInput.svelte";
    // import { beginTraining, stopTraining } from "../../stores/train/actions";

    // import {
    //     beginTraining,
    //     stopTraining,
    // } from "../../src_motion/stores/train/actions";
    // import GraphContainer from "./GraphContainer.svelte";
    // import {
    //     trainEpochs,
    //     trainingState,
    //     trainIsUnlocked,
    //     trainLogAccuracy,
    //     trainLogLoss,
    // } from "../../stores/train/store";
    // import {
    //     trainEpochs,
    //     trainingState,
    //     trainIsUnlocked,
    //     trainLogAccuracy,
    //     trainLogLoss,
    // } from "../../src_motion/stores/train/store";

    // import { isFullyLoaded } from "../../stores/ui/store";
    import { isFullyLoaded } from "../../stores/ui/store";
    // import EarlyStopping from "./EarlyStopping.svelte";
    import Description from "../../../../components/common/Description.svelte";
    import { writable } from "svelte/store";
    import { getTrainerADD } from "../../../stores/actions";
    import {
        beginTraining,
        stopTraining,
    } from "../../stores/train/actions";
    import {trainIsUnlocked, trainingState} from "../../stores/train/store";
    

    $: if ($isFullyLoaded) {
        if (!$trainIsUnlocked) {
            navigate(BASE_PATH, { replace: true });
        }
    }

    onMount(async () => {
        trainer = await getTrainerADD();
        trainer_ = trainer;

        if (trainer == "FUI") {
            trainer = "motion";
        }

    });

    const strAsset = {
        trainTitle: "모델 학습",
        trainDesc:
            "모델이 개선을 멈추면 완료되고 훈련을 중단할 수 있습니다. 높은 정확도를 얻는 데 어려움이 있다면 더 많은 고유한 데이터를 기록하십시오.",
        btnStart: "학습 시작",
        btnStop: "학습 중지",
        captionStop: "멈추는 중...",
        captionAlert: "이 페이지는 학습이 진행되는 동안 열려 있어야 합니다.",
    };
</script>

<div class="contents">
    <Description title={strAsset.trainTitle} explanation={strAsset.trainDesc} />
    <div class="input-container">
        <slot name="train-setting" />
        <!-- <div class="column">
        <NumberInput
            name="input_epochs"
            classStr="subhead-1"
            bind:value={$trainEpochs}
            min={1}
        /><label class="subhead-1" for="input_epochs">Epochs</label>
    </div>
    <div class="column">
        <EarlyStopping />
    </div> -->
    </div>
    <div class="btn-start row">
        <div>{$trainingState}</div>
        {#if $trainingState === "idle"}
            <button class="btn-stroke" on:click={beginTraining}
                >{strAsset.btnStart}</button
            >
        {:else if $trainingState === "training"}
            <button class="btn-stroke" on:click={stopTraining}
                >{strAsset.btnStop}</button
            >
        {:else if $trainingState === "stop_queued"}
            <button class="btn-stroke" disabled
                >{strAsset.captionStop}</button
            >
        {/if}

        {#if $trainingState !== "idle"}
            <p class="train-alert">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.27 3H15.73L21 8.27V15.73L15.73 21H8.27L3 15.73V8.27L8.27 3ZM14.9 19L19 14.9V9.1L14.9 5H9.1L5 9.1V14.9L9.1 19H14.9ZM12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17ZM13 7H11V14H13V7Z"
                        fill="#386dff"
                    />
                </svg>
                {strAsset.captionAlert}
            </p>
        {/if}
    </div>

    <div class=" gragh_div">
        <slot name="train-graph" />
        <!-- <GraphContainer
        title="Accuracy"
        label1="Train accuracy"
        label2="Validation accuracy"
        decimals={2}
        maxX={$trainEpochs}
        data={[$trainLogAccuracy.train, $trainLogAccuracy.validation]}
    />
    <GraphContainer
        title="Loss"
        label1="Train loss"
        label2="Validation loss"
        decimals={4}
        maxX={$trainEpochs}
        data={[$trainLogLoss.train, $trainLogLoss.validation]}
    /> -->
    </div>
</div>
<FloatingBtn />

<style lang="scss">
    @import "@scss/vars";
    // label {
    //     margin-right: 40px;
    // }

    // .row {
    //     padding: 0 40px;
    // }
    .input-container {
        margin-bottom: 32px;
    }
    .train-alert {
        margin-left: 35px;
        color: $color-deepblue;
        svg {
            vertical-align: middle;
        }
    }
    .btn-start {
        margin-bottom: 64px;
    }
    // .gragh_div {
    //     padding: 0px;
    // }
</style>
