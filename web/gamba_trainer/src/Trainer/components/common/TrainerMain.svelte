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
  import { getContext, onMount } from "svelte";  

  import SubBanner from "../../../components/common/SubBanner.svelte";
  import SubNav from "./SubNav.svelte";
  import MainNav from "./MainNav.svelte";

  import UnsavedProjectPrompt from "../../general/prompts/UnsavedProjectPrompt.svelte";
  import LocalStorageFullPrompt from "../../general/prompts/LocalStorageFullPrompt.svelte";
  import DownloadModelPrompt from "../../general/prompts/DownloadModelPrompt.svelte";
  import motionIcon from "../../assets/img/ic_motion.svg";
  import speechIcon from "../../assets/img/ic_speech.svg";
  import visionIcon from "../../assets/img/ic_vision.svg";

  import { promptStack } from "../src_motion/stores/ui/store";
  import {
    pushErrorMessage,
    pushPropmt,
  } from "../src_motion/stores/ui/actions";
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

  const strAsset = {
    bannerTitleMotion: "모션",
    bannerTitleSpeech: "소리&음성",
    bannerTitlevision: "이미지",
  };
</script>

<header>  
  <!-- {#if trainerADD === "motion"}
    <SubBanner title={strAsset.bannerTitleMotion} titleIcon={motionIcon} />
  {:else if trainerADD === "speech"}
    <SubBanner title={strAsset.bannerTitleSpeech} titleIcon={speechIcon} />
  {:else if trainerADD === "vision"}
    <SubBanner title={strAsset.bannerTitlevision} titleIcon={visionIcon} />
  {/if} -->
  <SubBanner />
  <div class="section">
    <SubNav />
  </div>
</header>
<nav class="section"><MainNav /></nav>
<main class="section" aria-live="polite">
  <slot />
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
  nav {
    position: sticky;
    top: 10px;
    z-index: 1;
  }
</style>
