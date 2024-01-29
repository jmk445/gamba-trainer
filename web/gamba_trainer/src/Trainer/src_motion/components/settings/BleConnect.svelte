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
    
    //import { popPrompt } from "@motion/stores/ui/actions";    
    async function handleConnect() {
      await connect();
      //popPrompt();
    }
  </script>

    <div class="bluetooth">
        <p>Bluetooth를 통해 키트 연결</p>
            
        <button class="btn-connect button" on:click={handleConnect}>
          <img src="#" alt="블루투스" />

          <span>Connect</span>
        </button>

        <p>
          또는, 연결하지 않고 진행합니다.<br />
          추후 상단의 Connect 탭으로 연결할 수 있습니다.
        </p>
    </div>


<!--     
    <style lang="scss">
      p {
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
    
   -->