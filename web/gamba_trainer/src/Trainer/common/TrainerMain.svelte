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
    
  import SubBanner from "../../common/SubBanner.svelte";
  import SubNav from "./SubNav.svelte";
  import MainNav from "./MainNav.svelte";

  import UnsavedProjectPrompt from "../../general/prompts/UnsavedProjectPrompt.svelte";
  import LocalStorageFullPrompt from "../../general/prompts/LocalStorageFullPrompt.svelte";
  import DownloadModelPrompt from "../../general/prompts/DownloadModelPrompt.svelte";  

  import { promptStack } from "../src_motion/stores/ui/store";
  import { pushErrorMessage, pushPropmt } from "../src_motion/stores/ui/actions";
  import persistStore, { dirty } from "../src_motion/stores/utils/persistStore";

  onMount(() => {
    persistStore.onError((error) => {
      if (error.name === "LocalStorageError") {
        pushPropmt("localstorage_full");
      } else if (error.name === "DeserializeError") {
        pushErrorMessage(
          "Something went wrong. Please check the console for more details.",
        );
      } else {
        pushErrorMessage(error.message);
      }
    });
  });
</script>

<!-- <div class="main-container">
  <SubBanner title="Motion Tainer" />
  <SubNav />
  
  <div class="container">    
    <aside class="nav-container">
      <MainNav trainer="motion"/>      
    </aside>
    <main class="section" aria-live="polite">
      <slot />
    </main>
  </div>
</div> -->
<header>
  <SubBanner title="Motion Trainer"/>
  <SubNav/>
</header>
<nav><MainNav trainer="motion"/> </nav>
<main class="section" aria-live="polite">
  <slot/>
</main>

{#if $promptStack}
  {#if $promptStack[$promptStack.length - 1].name === "unsaved_project"}
    <UnsavedProjectPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "localstorage_full"}
    <LocalStorageFullPrompt />
  {:else if $promptStack[$promptStack.length - 1].name === "download_model"}
    <DownloadModelPrompt />
  {/if}
{/if}

<style lang="scss">
  nav{
    position: sticky;
    top:10px;
    z-index: 1;
  }
</style>
