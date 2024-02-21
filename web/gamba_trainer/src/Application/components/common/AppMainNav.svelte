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
  import { onMount, onDestroy } from "svelte";
  import { Link } from "svelte-routing";
  // import { isConnected$3, addEventListner } from "../../FUI/stores/tf4micro-motion-kit-v1";  
  import { getIsConnected} from "../../FUI/stores/tf4micro-motion-kit-v2";  
  // import { isConnected } from "@motion/stores/bleInterfaceStore/store";
  // import { testIsUnlocked } from "../src_motion/stores/test/store";
  // import { trainIsUnlocked } from "../src_motion/stores/train/store";

  let connectionClass = "red";
  let interval;
  export let appName;

  onMount(() => {     
    connectionUpdate();
    // 1초마다 isConnected 값을 확인
    interval = setInterval(() => {
      connectionUpdate();
    }, 1000);
  });

  // onMount(() => {
  //   addEventListener();
  // });

  onDestroy(() => {
    clearInterval(interval);
  });

  // function connectionUpdate() {    
  //   // const connection = document.getElementById("connection");
  //   if (isConnected$3()) {
  //     connectionClass = "green";
  //     // connection.innerText = "Disconnect";
  //   } else {
  //     connectionClass = "red";
  //     // connection.innerText = "Connect";
  //   }
  // }
  function connectionUpdate() {    
    // const connection = document.getElementById("connection");    
    let connection = getIsConnected();    
    if (connection) {      
      connectionClass = "green";
      // connection.innerText = "Disconnect";
    } else {
      connectionClass = "red";
      // connection.innerText = "Connect";
    }
  }

  const strAsset ={
    navOne : "연결",
    navTwo : "선택&전송",
    navThree : "실행"
  }
</script>

<nav class="app-main-nav nav section">
  <ul>
    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${appName}-connect`,
      )} class="connect"
    >
      <span class={`dot ${connectionClass}`} />
      <Link to="fui-connect"><span>{strAsset.navOne}</span></Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${appName}-choose`,
      )}
    >
      <Link to="fui-choose">{strAsset.navTwo}</Link>
    </li>

    <li
      class:active={location.pathname.includes(
        BASE_PATH + `/${appName}-experience`,
      )}
    >
      <Link to="fui-experience">{strAsset.navThree}</Link>
    </li>

  </ul>
</nav>

<style lang="scss">
  @import "@scss/vars";
  .app-main-nav ul {
    margin-top: 110px;
  }
  .connect{

  }
</style>
