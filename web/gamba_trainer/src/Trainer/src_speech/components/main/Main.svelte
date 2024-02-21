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
  // import { pushPropmt } from "../../stores/ui/actions";
  import { hasShownConnectPrompt } from "../../stores/ui/store";

  import DownloadButton from "./DownloadButton.svelte";
  import Header from "./Header.svelte";
  import SideNav from "./SideNav.svelte";

  import UnsavedProjectPrompt from "../general/prompts/UnsavedProjectPrompt.svelte";
  import { promptStack } from "../../stores/ui/store";
  import ConnectPrompt from "../general/prompts/ConnectPrompt.svelte";
  import { pushErrorMessage, pushPropmt } from "../../stores/ui/actions";
  import persistStore, { dirty } from "../../stores/utils/persistStore";
  import LocalStorageFullPrompt from "../general/prompts/LocalStorageFullPrompt.svelte";
  import DownloadModelPrompt from "../general/prompts/DownloadModelPrompt.svelte";
  import { isConnected } from "@speech/stores/bleInterfaceStore/store";

  onMount(() => {
    if (!$isConnected) {
      pushPropmt("connect");
    }

    persistStore.onError((error) => {
      if (error.name === "LocalStorageError") {
        pushPropmt("localstorage_full");
      } else if (error.name === "DeserializeError") {
        pushErrorMessage(
          "Something went wrong. Please check the console for more details."
        );
      } else {
        pushErrorMessage(error.message);
      }
    });
  });
</script>

<div class="main-container">
  <Header />

  <div class="container">
    <aside class="nav-container">
      <SideNav />
      <DownloadButton />
    </aside>

    <main aria-live="polite">
      <slot />
    </main>
  </div>
</div>

{#if $promptStack}
  {#if $promptStack[$promptStack.length - 1].name === "unsaved_project"}
    <UnsavedProjectPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "connect"}
    <ConnectPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "localstorage_full"}
    <LocalStorageFullPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "download_model"}
    <DownloadModelPrompt />
  {/if}
{/if}


<style lang="scss">
  @import "@scss/vars";

  .main-container {
    display: flex;
    height: 100%;
    flex-direction: column;
    // overflow: hidden;
  }

  .container {
    // overflow: hidden;
    flex: 1;
  }

  main {
    width: 100%;
    padding: 60px 15% 0 15%;
    overflow: auto;
  }

  aside {
    display: flex;
    align-items: center;
    flex-direction: row;
    height: 60px;
    width: 70%;
    margin: 0 15% 0 15%;
    max-width: 80%;
  }
</style>
