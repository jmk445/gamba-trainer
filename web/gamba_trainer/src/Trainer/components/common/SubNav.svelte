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
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    
    import DropDown from "../../../components/general/DropDown.svelte";
    import ClearAllPrompt from "../../../components/general/prompts/ClearAllPrompt.svelte";

    import HelpPrompt from "../../../components/general/prompts/HelpPrompt.svelte";
    import { getTrainerADD } from "../../stores/actions";    
    // import { isConnected } from "../../src_motion/stores/bleInterfaceStore/store";
    let dropDownVisible;
    let showClearAllPrompt = false;
    let showHelpPrompt = false;
    let connectionClass = "red";
    let interval;

    let trainer;
    let bleModuleAction, bleModuleStore, fileAction;

    let isConnected_ = writable();

    //동적 import
    onMount(async () => {
        trainer = await getTrainerADD();

        if(trainer == "FUI"){
            trainer = "motion";
        }

        await import(
            `../../src_${trainer}/stores/bleInterfaceStore/actions`
        ).then((module) => {
            bleModuleAction = module;
        });

        await import(
            `../../src_${trainer}/stores/bleInterfaceStore/store`
        ).then((module) => {
            bleModuleStore = module;
            isConnected_ = module.isConnected;
        });

        await import(
            `../../../Trainer/src_${trainer}/stores/file/actions`
        ).then((module) => {
            fileAction = module;
        });

        //@todo
        //connect 되고 새로 고침할 시 connection 유지

        interval = setInterval(() => {
            connectionUpdate();
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

    function connectionUpdate() {
        // isConnected_ = bleModuleStore.isConnected;

        const connection = document.getElementById("connection");
        // if ($isConnected_) {
        //     connectionClass = "green";
        //     connection.innerText = strAsset.navOneB;
        // } else {
        //     connectionClass = "red";
        //     connection.innerText = strAsset.navOneA;
        // }
        if (bleModuleStore.getConnection()) {
            connectionClass = "green";
            connection.innerText = strAsset.navOneB;
        } else {
            connectionClass = "red";
            connection.innerText = strAsset.navOneA;
        }
    }

    function handleSaveSelect(value) {
        switch (value) {
            case "save":
                fileAction.saveFile();
                break;

            case "save-as":
                fileAction.saveFileAs();
                break;
        }
        dropDownVisible = null;
    }

    function handleDocumentClick(e) {
        // always close menus when user clicks anywhere except on the drop-down items
        let target = e.target;
        while (target && target !== document) {
            if (target.classList.contains("drop-down-menu-item")) {
                return;
            }
            target = target.parentNode;
        }
        dropDownVisible = null;
    }

    function handleConnect() {
        if ($isConnected_) {
            bleModuleAction.disconnect();
        } else {
            bleModuleAction.connect();
        }
    }

    function showDropDown(dropDownName) {
        dropDownVisible = dropDownName;
    }

    function handleLoad() {
        fileAction.loadFile();
    }

    onMount(() => {
        document.addEventListener("click", handleDocumentClick, true);

        return () => {
            document.addEventListener("click", handleDocumentClick, true);
        };
    });

    const strAsset = {
        navOneA: "연결",
        navOneB: "연결 끊기",
        navTwo: "저장",
        navThree: "불러오기",
        navFour: "재시작",
        navFive: "도움말",
        navTwoA: "프로젝트 저장",
        navTwoB: "다른 이름으로 프로젝트 저장",
    };
</script>

<div class="sub-nav">
    <ul>
        <li>
            <span class={`dot ${connectionClass}`} />
            <button id="connection" on:click={handleConnect}
                >{strAsset.navOneA}</button
            >
        </li>
        <li>
            <button class="menu-item-save" on:click={() => showDropDown("save")}
                >{strAsset.navTwo}</button
            >

            {#if dropDownVisible === "save"}
                <DropDown
                    options={[
                        { label: strAsset.navTwoA, value: "save" },
                        { label: strAsset.navTwoB, value: "save-as" },
                    ]}
                    onSelect={handleSaveSelect}
                    selector=".menu-item-save"
                />
            {/if}
        </li>
        <li>
            <button on:click={() => (showClearAllPrompt = true)}
                >{strAsset.navFour}</button
            >
            {#if showClearAllPrompt}
                <ClearAllPrompt onClose={() => (showClearAllPrompt = false)} />
            {/if}
        </li>
        <li>
            <button on:click={handleLoad}>{strAsset.navThree}</button>
        </li>
        <li>
            <button on:click={() => (showHelpPrompt = true)}
                >{strAsset.navFive}</button
            >
            {#if showHelpPrompt}
                <HelpPrompt onClose={() => (showHelpPrompt = false)} />
            {/if}
        </li>
    </ul>
</div>

<style lang="scss">
    .sub-nav {
        margin: 12px 0 72px 0px;

        ul {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
        }
        li {
            display: inline-block;
            margin-left: 32px;
        }
    }
    .dot {
        margin: 0;
    }
</style>