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
  import { Link } from "svelte-routing";
  import { testIsUnlocked } from "../src_motion/stores/test/store";
  import { trainIsUnlocked } from "../src_motion/stores/train/store";
  export let trainer;
</script>

<div class="train-nav nav section">
  <ul>
    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-settings`,
      )}
    >
      <Link to="{trainer}-settings">Choose your settings</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-capture`,
      )}
    >
      <Link to="{trainer}-capture">Capture your data</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${trainer}-train`)}
      class:disabled={!$trainIsUnlocked}
      aria-disabled={!$trainIsUnlocked}
    >
      <Link to="{trainer}-train">Train your model</Link>
    </li>

    <li
      class:active={location.pathname.includes(BASE_PATH + `/${trainer}-test`)}
      class:disabled={!$testIsUnlocked}
      aria-disabled={!$testIsUnlocked}
    >
      <Link to="{trainer}-test">Test your model</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${trainer}-convertSend`,
      )}
    >
      <Link to="{trainer}-convertSend">Convert/Send</Link>
    </li>
  </ul>
</div>

<style lang="scss">
  @import "@scss/vars";
  .train-nav {

    ul {
      height: 50px;
    }
  }
</style>
