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
    import DropDown from "../../general/DropDown.svelte";
    import ClearAllPrompt from "../../general/prompts/ClearAllPrompt.svelte";
    import { saveFile, loadFile, saveFileAs } from "../../Trainer/src_motion/stores/file/actions";

    let dropDownVisible;
    let showClearAllPrompt = false;    
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
            connection.innerText = "Disconnect";
        } else {
            connectionClass = "red";
            connection.innerText = "Connect";
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
</script>
  
    
<nav class="sub-nav section">
    <div>
        <ul>        




            <li>
                <button on:click={handleConnect}>Help</button>
            </li>
            <li>
                <button on:click={() => (showClearAllPrompt = true)}
                    >Start Over</button
                >
                {#if showClearAllPrompt}
                    <ClearAllPrompt onClose={() => (showClearAllPrompt = false)} />
                {/if}
    
            </li>
            <li>
                <button on:click={handleLoad}>Load</button>
            </li>
            <li>
                <button class="menu-item-save" on:click={() => showDropDown("save")}
                    >Save</button>
    
                {#if dropDownVisible === "save"}
                    <DropDown
                        options={[
                            { label: "Save Project", value: "save" },
                            { label: "Save Project As...", value: "save-as" },
                        ]}
                        onSelect={handleSaveSelect}
                        selector=".menu-item-save"
                    />
                {/if}
            </li>
            <li>
                <span class={`dot ${connectionClass}`}/>
                <button id='connection' on:click={handleConnect}>Connect</button>
                
            </li>
        </ul>
    </div>
</nav>

<style lang="scss">
    .sub-nav {
        margin-bottom: 80px;
        li {
            float: right;
            margin-left: 32px;
        }        
    }
    .dot{
        margin: 0;
    }
</style>

