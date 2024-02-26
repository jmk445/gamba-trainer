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

    import icBluetooth from "@assets/img/ic_bluetooth_black.svg";
    import { get } from "svelte/store";
    import Description from "../../../components/common/Description.svelte";
    import FloatingBtn from "../../../components/general/floating/floatingBtn.svelte";
    import { getTrainerADD } from "../../stores/actions";
    // import {
    //     connect,
    //     setImuDataMode,
    // } from "../../src_motion/stores/bleInterfaceStore/actions";

    let trainer, bleActions;

    onMount(async () => {
        trainer = await getTrainerADD();

        if(trainer == "FUI"){
            trainer = "motion";
        }
        if(trainer == "MOLE"){
            trainer = "speech";
        }
        if(trainer == "MASK"){
            trainer = "vision";
        }
        

        await import(
            `../../src_${trainer}/stores/bleInterfaceStore/actions.js`
        ).then((module) => {
            bleActions = module;
        });

        bleActions.setImuDataMode();
    });

    function handleConnect() {
        bleActions.connect();
    }

    const strAsset = {
        bluetoothTitle : "Bluetooth를 통해 키트 연결",
        bluetoothBtn : "연결",
        bluetoothCaption : `또는, 연결하지 않고 진행합니다.\n추후 상단의 연결 메뉴로 연결할 수 있습니다.`,
        modelSettingTitle : "모델 구조 선택",
        modelSettingDesc : "아래 모델 중 원하는 모델을 선택하여 학습을 진행할 수 있습니다.",                
    }
</script>

<div class="bluetooth-container contents">
    <p>{strAsset.bluetoothTitle}</p>

    <button class="btn-connect btn-stroke" on:click={handleConnect}>
        <img src={icBluetooth} alt="블루투스" />

        <span>{strAsset.bluetoothBtn}</span>
    </button>

    <p>{strAsset.bluetoothCaption}</p>
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
<div class="capture-choose-container contents">
    
    <div class="settings-container">
        <slot name="settings-capture" />
    </div>
</div>

<FloatingBtn />


<style lang="scss">
    .bluetooth-container {
        text-align: center;
        margin-top: 56px;

        .btn-connect {
            margin: auto;
            display: flex;
            padding: 10px 36px;
            img{
                margin-right: 12px;
            }
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
