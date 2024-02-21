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
  import { testIsUnlocked } from "../../stores/test/store";
  import { trainIsUnlocked } from "../../stores/train/store";
  import Icon from "../general/Icon.svelte";
</script>

<nav>
  <ul>
    <li
      class="h2 menu-item"
      class:active={location.pathname.includes(BASE_PATH + "/speech-capture")}
    >
      <Link to="speech-capture">
        Capture your data
      </Link>
    </li>
    <li
      class="h2 menu-item"
      class:active={location.pathname.includes(BASE_PATH + "/speech-train")}
      class:disabled={!$trainIsUnlocked}
      aria-disabled={!$trainIsUnlocked}
    >
      <Link to="speech-train">
        Train your model
      </Link>
    </li>
    <li
      class="h2 menu-item"
      class:active={location.pathname.includes(BASE_PATH + "/speech-test")}
      class:disabled={!$testIsUnlocked}
      aria-disabled={!$testIsUnlocked}
    >
      <Link to="speech-test">
        Test your model
      </Link>
    </li>
  </ul>
</nav>

<style lang="scss">
  @import "@scss/vars";

  ul {
    display: flex;        /* 항목들을 가로로 배치 */
    list-style: none;     /* 기본 리스트 스타일 제거 */
    padding: 0;           /* 기본 패딩 제거 */
    border-radius: 30px;
    background-color: $color-grey-step01;
    width: auto;
    height: auto;
    margin-right: 50px;
  }
  
  .menu-item {
    width: 232px;
    padding: 1rem 0 1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;

    &:hover {
      :global(a) {
        opacity: 0.5;
      }
    }

    &.disabled {
      opacity: 0.25;
      pointer-events: none;
    }
    .icon {
      display: block;
      margin-right: 1rem;
    }

    :global(a) {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
    &.active {
      // border-top: $border-width solid $color-fg-primary;
      // border-bottom: $border-width solid $color-fg-primary;
      background-color: $color-deepblue;
      color: white;
      border-radius: 30px;
    }
  }
</style>
