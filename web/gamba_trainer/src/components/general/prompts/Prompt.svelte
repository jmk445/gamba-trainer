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
  import { popPrompt } from "@motion/stores/ui/actions";
  import closeBtn from "../../../assets/icons/close_24px.svg";
  export let title;
  export let allowClickDismiss = true;
  export let closePrompt = () => {};
  let promtContainer;

  function handleClickClose(e) {
    if (allowClickDismiss && e.target === promtContainer) {
      popPrompt();
    }
  }
</script>

<div
  class="prompt container"
  bind:this={promtContainer}
  on:click={handleClickClose}
>
  <div class="content">
    <div class="title">
      <p>{title}</p>
      <button on:click={closePrompt}
        ><span class="btn-close"><img src={closeBtn} alt="닫기" /></span
        ></button
      >
    </div>
    <slot />
  </div>
</div>

<style lang="scss">
  @import "@scss/vars";

  .prompt {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    z-index: 9;
    align-items: center;
    .content {
      background: $color-bg-primary;
      border-radius: 8px;
      .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-radius: 8px 8px 0 0;
        padding:24px;
        background-color: $color-banner-blue;
        p{
          display: inline;
          font-size: 1.5rem;
        }
        
      }
    }
  }
</style>
