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
  import Logo from "@speech/components/general/Logo";
  import { onMount, onDestroy } from "svelte";
  import { connect, disconnect } from "@speech/stores/bleInterfaceStore/actions";
  import { isConnected } from "@speech/stores/bleInterfaceStore/store";
  import DropDown from "../general/DropDown.svelte";
  import ClearAllPrompt from "../general/prompts/ClearAllPrompt";
  import { saveFile, loadFile, saveFileAs } from "../../stores/file/actions";
  import { sketchFileUrl } from "../../stores/ui/store";
  import logoPng from "@assets/icons/Symbol_RGB.png";
  import { Link } from "svelte-routing";

  let dropDownVisible;
  let showClearAllPrompt = false;
  let connectionClass = "red";
  let interval;

  onMount(() => {
    connectionUpdate();
    // 1초마다 isConnected 값을 확인
    interval = setInterval(() => {
      connectionUpdate()
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  function connectionUpdate() {
    const connection = document.getElementById('connection');
    if ($isConnected) {
      connectionClass = "green"
      connection.innerText = "Disconnect";
    }
    else {
      connectionClass = "red"
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
    }
    else {
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

<header>
  <div class="branding">
    <div class:active={location.pathname.includes(BASE_PATH + "/")}>
      <Link to="/">
        <img src={logoPng} alt="Gamba Logo" />
      </Link>
    </div>
    
  </div>
  <div class="name">
    <h1>Tiny Speech Trainer</h1>
    <span class={`dot ${connectionClass}`}/>
  </div>
  <div class="menu subhead-1">
    <ul>
      <li>
        <button class="menu-item-save" on:click={() => showDropDown("save")}
          >Save</button
        >
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
      <li><button on:click={handleLoad}>Load</button></li>
      <li>
        <button on:click={() => (showClearAllPrompt = true)}>Start Over</button>

        {#if showClearAllPrompt}
          <ClearAllPrompt onClose={() => (showClearAllPrompt = false)} />
        {/if}
      </li>
      <li><button id='connection' on:click={handleConnect}>Connect</button></li>
    </ul>
  </div>
</header>

<style lang="scss">
  @import "@scss/vars";
  .name {
    display: flex;
    align-items: center;  /* 수직 중앙 정렬 */
  }
  .dot {
    margin-left: 24px;
    width: 10px;
    height: 10px;
  }
  img {
    width: 90px; //130px 에서 수정
  }
  
  header {
    width: 100%;
    // background-color: $color-bg-secondary;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 17px 17px 17px;
    // border-bottom: $border-width solid black;
    .name {
      width: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .branding, .menu {
      width: 25%;
    }
    .menu {
      display: flex;
      justify-content: right;
      padding-right: 5px;
    }
    ul {
      margin-top: 4px;
    }
    li {
      display: inline-block;
      margin: 0 17px 0 0;
    }
  }
</style>
