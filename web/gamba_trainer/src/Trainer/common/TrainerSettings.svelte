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
    import { onMount } from "svelte";
    
    import Description from "../../common/Description.svelte";
    // import { connect } from "@motion/stores/bleInterfaceStore/actions";
    import {
        connect,
        setImuDataMode,
    } from "../src_motion/stores/bleInterfaceStore/actions";
    // import { setImuDataMode } from "../../stores/bleInterfaceStore/actions";

    // import { imuVelocity } from "../../stores/bleInterfaceStore/store";

    // import {
    //     captureDelay,
    //     captureSamples,
    //     captureThreshold,
    //     minMaxValues,
    // } from "../../stores/captureSettings/store";

    // import SettingsInput from "./SettingsInput.svelte";
    // import { hasRecordings } from "../../stores/capture/store";
    // import { hasRecordings } from "../src_motion/stores/capture/store";
    // import { clearRecordings } from "../../stores/capture/actions";
    // import ChangeAfterRecordPrompt from "./ChangeAfterRecordPrompt.svelte";
    

    // import BleConnect from "./BleConnect.svelte";

    // let clearRecordPrompt;

    async function handleConnect() {
        await connect();
        //popPrompt();
    }

    // async function checkForRecordings(store, value) {
    //     if ($hasRecordings) {
    //         clearRecordPrompt.show((didClear) => {
    //             if (didClear) {
    //                 store.set(value);
    //             } else {
    //                 const prevValue = get(store);
    //                 store.set(value);

    //                 setTimeout(() => {
    //                     store.set(prevValue);
    //                 }, 10);
    //             }
    //         });
    //     } else {
    //         store.set(value);
    //     }
    // }
    onMount(() => {
        setImuDataMode();
    });

    

    const strAsset = {
        bluetoothTitle : "Bluetooth를 통해 키트 연결",
        bluetoothBtn : "연결",
        bluetoothCaption : `또는, 연결하지 않고 진행합니다.\n추후 상단의 연결 메뉴로 연결할 수 있습니다.`,
        captureSettingTitle : "캡처 설정 선택",
        captureSettingDesc : '아래 슬라이더를 끌어 데이터를 수집하는 방법을 사용자가 지정합니다. "예제용 모델 만들기" 선택한 경우, 설정은 고정됩니다.',
        modelSettingTitle : "모델 선택",
        modelSettingDesc : "아래 모델 중 원하는 모델을 선택하여 학습을 진행할 수 있습니다."
    }
</script>

<div class="bluetooth-container contents">
    <p>{strAsset.bluetoothTitle}</p>

    <button class="btn-connect btn-stroke" on:click={handleConnect}>
        <img src="#" alt="블루투스" />

        <span>{strAsset.bluetoothBtn}</span>
    </button>

    <p>{strAsset.bluetoothCaption}</p>
</div>

<div class="capture-choose-container contents">
    <Description
        title={strAsset.captureSettingTitle}
        explanation={strAsset.captureSettingDesc}
    />

    <div class="settings-container">
        <slot name="settings-capture" />
        <!-- <div class="panel">
            <div>
                <h2>Capturing threshold</h2>
                <p>
                    기록을 시작하는 최소 동작입니다. 임계값 이상의 동작이
                    감지되면 기록이 시작됩니다. 해당값은 모델에 의해 샘플
                    근사화에 사용됩니다.
                </p>
            </div>
            <div class="form-container input-align-right">
                <SettingsInput
                    name="capturing-threshold"
                    value={$captureThreshold}
                    label="Capture threshold"
                    onChange={(value) =>
                        checkForRecordings(captureThreshold, value)}
                    min={minMaxValues.captureThreshold[0]}
                    max={minMaxValues.captureThreshold[1]}
                    step={0.001}
                />
            </div>
        </div>

        <div class="panel">
            <div>
                <h2>Number of samples</h2>
                <p>
                    기록은 초당 약 100개의 샘플로 이루어집니다. 더 적은 수의
                    샘플을 선택하면 움직임 데이터를 캡처하는 과정이 빨라질
                    것입니다.
                </p>
            </div>
            <div class="form-container input-align-right">
                <SettingsInput
                    name="number-of-samples"
                    value={$captureSamples}
                    label="Number of samples to record"
                    onChange={(value) =>
                        checkForRecordings(captureSamples, value)}
                    min={minMaxValues.captureSamples[0]}
                    max={minMaxValues.captureSamples[1]}
                    step={1}
                />
            </div>
        </div>

        <div class="panel">
            <div>
                <h2>Delay between captures(seconds)s</h2>
                <p>
                    한 기록이 완료된 후 다른 기록을 허용하기 전에 대기할 시간을
                    초 단위로 제공합니다. 이는 이중 트리거링을 방지하기 위한
                    것입니다.
                </p>
            </div>
            <div class="form-container input-align-right">
                <SettingsInput
                    name="delay-between-captures"
                    value={$captureDelay}
                    label="Delay in seconds between captures"
                    onChange={(value) =>
                        checkForRecordings(captureDelay, value)}
                    min={minMaxValues.captureDelay[0]}
                    max={minMaxValues.captureDelay[1]}
                    step={0.001}
                />
            </div>
        </div> -->
    </div>
</div>

<div class="model-choose contents">
    <Description
        title={strAsset.modelSettingTitle}
        explanation={strAsset.modelSettingDesc}
    />
    <div class="model-select-container">
        <slot name="settings-model"/>
    </div>
</div>


<style lang="scss">
    .bluetooth-container {
        text-align: center;
        margin-top: 56px;

        button {
            margin: auto;
            display: block;
        }
        p:first-child {
            font-size: 1.5rem;
            margin-bottom: 16px;
        }

        p:last-child {
            margin-top: 12px;
            font-size: 0.875rem;
        }
    }

</style>
