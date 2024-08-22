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
  // import MainNav from "../../../../../../../trash_bin/MainNav.svelte";
  import MainNavMotion from "../../src_motion/components/MainNavMotion.svelte";
  import MainNavSpeech from "../../src_speech/components/MainNavSpeech.svelte";
  import MainNavVision from "../../src_vision/components/MainNavVision.svelte";

  import UnsavedProjectPrompt from "../../../components/general/prompts/UnsavedProjectPrompt.svelte";
  import LocalStorageFullPrompt from "../../../components/general/prompts/LocalStorageFullPrompt.svelte";
  import DownloadModelPrompt from "../../../components/general/prompts/DownloadModelPrompt.svelte";

  import icMotion from "../../../assets/img/ic_motion.svg";
  import icSpeech from "../../../assets/img/ic_speech.svg";
  import icVision from "../../../assets/img/ic_vision.svg";

  import { promptStack } from "../../src_motion/stores/ui/store";
  import {
    pushErrorMessage,
    pushPropmt,
  } from "../../src_motion/stores/ui/actions";
  import persistStore, {
    dirty,
  } from "../../src_motion/stores/utils/persistStore";
  import { getTrainerADD } from "../../stores/actions";

  let trainer;
  onMount(async () => {
    trainer = await getTrainerADD();
    if (trainer === "FUI") {
      trainer = "motion";
    }
    if (trainer === "MOLE") {
      trainer = "speech";
    }
    if (trainer === "MASK") {
      trainer = "vision";
    }
  });

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
  {#if trainer === "motion"}
    <SubBanner title={strAsset.bannerTitleMotion} icTitle={icMotion} />
  {:else if trainer === "speech"}
    <SubBanner title={strAsset.bannerTitleSpeech} icTitle={icSpeech} />
  {:else if trainer === "vision"}
    <SubBanner title={strAsset.bannerTitlevision} icTitle={icVision} />
  {:else}
    <SubBanner title={trainer} />
  {/if}

  <div class="section">
    <SubNav />
  </div>
</header>
{#if trainer === "motion"}
  <nav class="section"><MainNavMotion /></nav>
{:else if trainer === "speech"}
  <nav class="section"><MainNavSpeech /></nav>
{:else if trainer === "vision"}
  <nav class="section"><MainNavVision /></nav>
{/if}

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

<!-- <style lang="scss">
  nav {
    position: sticky;
    top: 10px;
    z-index: 1;
  }
</style> -->
