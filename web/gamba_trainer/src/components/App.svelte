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
  import { Router, Route } from "svelte-routing";
  // 메인화면
  import Main from "./main/main.svelte";
  
  // 트레이너 선택 페이지
  import Train_Select from "../Trainer/components/main/Select.svelte"
  
  
  // fui
  import FuiConnect from "../Application/FUI/FUIConnect.svelte";
  import FuiChoose from "../Application/FUI/FUIChoose.svelte";
  import FuiExperience from "../Application/FUI/FUIExperience.svelte";
  
  // 예제 시나리오의 예제 선택페이지
  import App_Select from "../Application/components/main/Main.svelte";
  import MotionApps from "../Application/components/main/MotionApps.svelte";
  import SpeechApps from "../Application/components/main/SpeechApps.svelte";
  import VisionApps from "../Application/components/main/VisionApps.svelte";
  
  // 모든 트레이너 페이지에 공통으로 쓰임
  import Trainer_Start from "../Trainer/src_motion/components/dev/Start.svelte"
  import Trainer_Main from "../Trainer/common/TrainerMain.svelte";
  
  // 뭔지 모름
  import Motion_MemoryTest from "../Trainer/src_motion/components/dev/MemoryTest.svelte";
  import Motion_LabelDeleteTest from "../Trainer/src_motion/components/dev/LabelDeleteTest.svelte";
  import Speech_MemoryTest from "../Trainer/src_speech/components/dev/MemoryTest.svelte";
  import Speech_LabelDeleteTest from "../Trainer/src_speech/components/dev/LabelDeleteTest.svelte";
  //after 파일 정리
  // 모션
  import MotionSettings from "../Trainer/src_motion/components/settings/MotionSettings.svelte";
  import MotionCapture from "../Trainer/src_motion/components/capture/MotionCapture.svelte";
  import MotionTrain from "../Trainer/src_motion/components/train/MotionTrain.svelte";
  import MotionTest from "../Trainer/src_motion/components/test/MotionTest.svelte";
  import MotionConvert from "../Trainer/src_motion/components/convert/motionConvert.svelte";
  // 스피치
  import SpeechSettings from "../Trainer/src_speech/components/settings/SpeechSettings.svelte";
  import SpeechCapture from "../Trainer/src_speech/components/capture/SpeechCapture.svelte";
  import SpeechTrain from "../Trainer/src_speech/components/train/SpeechTrain.svelte";
  import SpeechTest from "../Trainer/src_speech/components/test/SpeechTest.svelte";
  import SpeechConvert from "../Trainer/src_speech/components/convert/SpeechConvert.svelte";
  export let url = "";
  const basepath = BASE_PATH === "" ? "/" : BASE_PATH;
</script>

<Router {url} {basepath}>
  <!-- <main> -->
    <Route path="/"><Main /></Route>
    <!-- 트레이너 선택페이지 -->
    <Route path="/train-select"><Train_Select /></Route>
    <!-- 예제 선택 페이지 -->
  <Route path="/motionApps-select"><App_Select><MotionApps/></App_Select></Route>
  <Route path="/speechApps-select"><App_Select><SpeechApps/></App_Select></Route>
  <Route path="/visionApps-select"><App_Select><VisionApps/></App_Select></Route>
<!-- fui 페이지 -->
  <Route path="/fui-connect"><FuiConnect/></Route>
  <Route path="/fui-choose"><FuiChoose/></Route>
  <Route path="/fui-experience"><FuiExperience/></Route>
    <!-- <Route path="/motion-start"><Trainer_Start /></Route>
    <Route path="/motion-settings"><Trainer_Main><Trainer_Settings /></Trainer_Main></Route>    
    <Route path="/motion-capture"><Trainer_Main><Trainer_Capture /></Trainer_Main></Route>
    <Route path="/motion-train"><Trainer_Main><Trainer_Train /></Trainer_Main></Route>
    <Route path="/motion-test"><Trainer_Main><Trainer_Test /></Trainer_Main></Route>
    <Route path="/motion-convertSend"><Trainer_Main><Motion_ConvertSend /></Trainer_Main></Route>
    <Route path="/motion-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route> -->

    
    <!-- <Route path="/motion-settings"><Trainer_Main><Trainer_Settings><MotionSettings_Capture slot="settings-capture"/></Trainer_Settings></Trainer_Main></Route>     -->
    <!-- <Route path="/motion-capture"><Trainer_Main><Trainer_Capture><MotionCapture_Label slot="capture-label"/><MotionCapture_List slot="capture-list"/></Trainer_Capture></Trainer_Main></Route> -->
    <!-- <Route path="/motion-train"><Trainer_Main><Trainer_Train><MotionTrain_Setting slot="train-setting"/><MotionTrain_Graph slot="train-graph"/></Trainer_Train></Trainer_Main></Route> -->
    <!-- <Route path="/motion-test"><Trainer_Main><Trainer_Test><MotionTest_Progress slot="test-progress"/></Trainer_Test></Trainer_Main></Route> -->



    <!-- 여기서부터 모션 시작 -->
    <Route path="/motion-start"><Trainer_Start /></Route>
    <Route path="/motion-settings"><Trainer_Main><MotionSettings/></Trainer_Main></Route>
    <Route path="/motion-capture"><Trainer_Main><MotionCapture/></Trainer_Main></Route>
    <Route path="/motion-train"><Trainer_Main><MotionTrain/></Trainer_Main></Route>
    <Route path="/motion-test"><Trainer_Main><MotionTest/></Trainer_Main></Route>
    <Route path="/motion-convertSend"><Trainer_Main><MotionConvert/></Trainer_Main></Route>
    <Route path="/motion-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route>

      <!-- 스피치 시작 -->
    <Route path="/speech-start"><Trainer_Start /></Route>
    <Route path="/speech-settings"><Trainer_Main><SpeechSettings/></Trainer_Main></Route>
    <Route path="/speech-capture"><Trainer_Main><SpeechCapture/></Trainer_Main></Route>
    <Route path="/speech-train"><Trainer_Main><SpeechTrain/></Trainer_Main></Route>
    <Route path="/speech-test"><Trainer_Main><SpeechTest/></Trainer_Main></Route>
    <Route path="/speech-convertSend"><Trainer_Main><SpeechConvert/></Trainer_Main></Route>
    <Route path="/motion-mem-test"><Trainer_Main><Speech_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Speech_LabelDeleteTest /></Trainer_Main></Route>

  <!-- </main> -->
</Router>

<style lang="scss">
  // main {
  //   height: 100vh;
  // }
</style>



