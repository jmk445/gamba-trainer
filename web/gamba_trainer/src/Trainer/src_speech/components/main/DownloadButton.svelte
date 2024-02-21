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
  import { trainedModel } from "../../stores/train/store";
  import { pushPropmt } from "../../stores/ui/actions";
  import Icon from "../general/Icon.svelte";
  import downloadAbleLogo from "@assets/icons/download Icon_able.png";
  import downloadDisableLogo from "@assets/icons/download Icon_disable.png";
</script>

<button
  disabled={!$trainedModel}
  class="download-button button primary"
  on:click={() => pushPropmt("download_model")}
  >
  {#if $trainedModel}
    <img src={downloadAbleLogo} alt="Download Logo" />
  {:else}
    <img src={downloadDisableLogo} alt="Download Logo" />
  {/if}
  Download model
</button>

<style lang="scss">
  @import "@scss/vars";
  .download-button {
    display: flex;
    justify-content: center;  /* 가로 정렬 */
    align-items: center;      /* 세로 정렬 */
    width: 175px;
    height: 56px;
    color: $color-deepblue;
    background: $color-grey-step01;
    border-radius: 30px;
    font-size: 11px;
    font-family: "Montserrat";
    font-weight: 600;
    &:enabled {
      filter: drop-shadow(0px 4px 4px #E0E5F2);
    }
    &:disabled {
      color: $color-grey-step04;
      background: $color-button-grey-step01;
    }
    &:before, &:after {
      border-radius: 30px;
      outline: 0px;
    }
    img {
      margin-right: 10px;
    }
  }
</style>
