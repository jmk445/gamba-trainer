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
  import { connect } from "@motion/stores/bleInterfaceStore/actions";
  import Icon from "../Icon.svelte";
  import Prompt from "./Prompt.svelte";
  import { popPrompt } from "@motion/stores/ui/actions";
  import { sketchFileUrl } from "../../../stores/ui/store";
  import logoPng from "@assets/icons/Symbol_Black_RGB.png";

  async function handleConnect() {
    await connect();
    popPrompt();
  }
</script>

<Prompt>
  <div class="inner">
    <h1>Connect</h1>
    <p class="instructions h2">
      Connect your TinyML kit via USB Cable
    </p>
    <div>
      <span class="dot green"></span>
      <span class="dot red"></span>
    </div>
    <button class="button primary icon-button prompt-button" on:click={handleConnect}
      ><Icon icon="bluetooth_24px.svg" /> Connect</button
    >
    <button on:click={popPrompt} class="notation-text"
      >Or, proceed without connecting</button
    >
    <footer>
      <img class="logo-img" src={logoPng} alt="Gamba Logo" />
    </footer>
  </div>
</Prompt>

<style lang="scss">
  h1 {
    margin-bottom: 15px;
    margin-top: 69px;
  }

  .instructions {
    margin-bottom: 34px;
  }

  .inner {
    width: 1100px;
    position: relative;
    text-align: center;
    z-index: 1;
    max-width: 700px;
    margin: 0 (103px - 30px);
    button {
      margin: 6px auto;
      font-weight: 500;
    }
  }

  footer {
    margin-top: 53px;
  }

  .dot {
    width: 10px;
    height: 10px;
  }

  .red {
    margin-right: 0px;
  }

</style>
