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
    // import { testIsUnlocked } from "../../stores/test/store";
    // import { trainIsUnlocked } from "../../stores/train/store";
    // export let trainer;

    const strAsset = {
      navOne : "모션",
      navTwo : "소리&음성",
      navThree : "이미지"
    }
  </script>
  
  <div class="app-nav nav section">
    <ul>
      <li
      class:active={location.pathname.includes(
        BASE_PATH + "motionApps-select",
      )}
      >
        <Link to="motionApps-select">{strAsset.navOne}</Link>
      </li>
  
      <li
        class:active={location.pathname.includes(
          BASE_PATH + "speechApps-select",
        )}
      >
        <Link to="speechApps-select">{strAsset.navTwo}</Link>
      </li>
  
      <li
        class:active={location.pathname.includes(BASE_PATH + "visionApps-select")}>
        <Link to="visionApps-select">{strAsset.navThree}</Link>
      </li>
    </ul>
  </div>
  
  <style lang="scss">
    .app-nav {
      margin-top: 112px;
      margin-bottom: 74px;
      ul {
      // display: flex;
      width: 480px;
      
      // border-radius: 100px;
      height: 62px;
    }
  }
  </style>
  