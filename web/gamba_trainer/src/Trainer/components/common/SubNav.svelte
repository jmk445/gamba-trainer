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
    import {
        connect,
        disconnect,
    } from "@motion/stores/bleInterfaceStore/actions";
    import { isConnected } from "@motion/stores/bleInterfaceStore/store";
    import DropDown from "../../../general/DropDown.svelte";
    import ClearAllPrompt from "../../../general/prompts/ClearAllPrompt.svelte";
    
    import {
        saveFile,
        loadFile,
        saveFileAs,
    } from "../../../Trainer/src_motion/stores/file/actions";
    import HelpPrompt from "../../../general/prompts/HelpPrompt.svelte";

    let dropDownVisible;
    let showClearAllPrompt = false;
    let showHelpPrompt = false;
    let connectionClass = "red";
    let interval;

    onMount(() => {
        connectionUpdate();
        // 1초마다 isConnected 값을 확인
        interval = setInterval(() => {
            connectionUpdate();
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

    function connectionUpdate() {
        const connection = document.getElementById("connection");
        if ($isConnected) {
            connectionClass = "green";
            connection.innerText = strAsset.navOneA;
        } else {
            connectionClass = "red";
            connection.innerText = strAsset.navOneA;
        }
    }

    function handleSaveSelect(value) {
        switch (value) {
            case "save":
                saveFile();
                break;

            case "save-as":
                saveFileAs();
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
        if ($isConnected) {
            disconnect();
        } else {
            connect();
        }
    }

    function showDropDown(dropDownName) {
        dropDownVisible = dropDownName;
    }

    function handleLoad() {
        loadFile();
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
        navTwoB: "다른 이름으로 프로젝트 저장"
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
                        { label: (strAsset.navTwoA), value: "save" },
                        { label: (strAsset.navTwoB), value: "save-as" },
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
