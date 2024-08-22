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
  import Train_Select from "../Trainer/components/main/Select.svelte";

  // fui
  import FuiConnect from "../Application/FUI/FUIConnect.svelte";
  import FuiChoose from "../Application/FUI/FUIChoose.svelte";
  import FuiExperience from "../Application/FUI/FUIExperience.svelte";

  // mask
  import MASKConnect from "../Application/MASK/MASKConnect.svelte";
  import MASKChoose from "../Application/MASK/MASKChoose.svelte";
  import MASKExperience from "../Application/MASK/MASKExperience.svelte";

    // mole
  import MOLEConnect from "../Application/MOLE/MOLEConnect.svelte";
  import MOLEChoose from "../Application/MOLE/MOLEChoose.svelte";
  import MOLEExperience from "../Application/MOLE/MOLEExperience.svelte";

  // 예제 시나리오의 예제 선택페이지
  import App_Select from "../Application/components/main/Main.svelte";
  import MotionApps from "../Application/components/main/MotionApps.svelte";
  import SpeechApps from "../Application/components/main/SpeechApps.svelte";
  import VisionApps from "../Application/components/main/VisionApps.svelte";

  // 모든 트레이너 페이지에 공통으로 쓰임
  import Trainer_Start from "../Trainer/components/main/Start.svelte";
  import Trainer_Main from "../Trainer/components/common/TrainerMain.svelte";

  // // ??
  // import Motion_MemoryTest from "../Trainer/src_motion/components/dev/MemoryTest.svelte";
  // import Motion_LabelDeleteTest from "../Trainer/src_motion/components/dev/LabelDeleteTest.svelte";
  // import Speech_MemoryTest from "../Trainer/src_speech/components/dev/MemoryTest.svelte";
  // import Speech_LabelDeleteTest from "../Trainer/src_speech/components/dev/LabelDeleteTest.svelte";

  // after 파일 정리
  // 모션
  import MotionSettings from "../Trainer/src_motion/components/settings/MotionSettings.svelte";
  import MotionCapture from "../Trainer/src_motion/components/capture/MotionCapture.svelte";
  import MotionTrain from "../Trainer/src_motion/components/train/MotionTrain.svelte";
  import MotionTest from "../Trainer/src_motion/components/test/MotionTest.svelte";
  import MotionConvert from "../Trainer/src_motion/components/convert/MotionConvert.svelte";
  
  // 스피치
  import SpeechSettings from "../Trainer/src_speech/components/settings/SpeechSettings.svelte";
  import SpeechCapture from "../Trainer/src_speech/components/capture/SpeechCapture.svelte";
  import SpeechTrain from "../Trainer/src_speech/components/train/SpeechTrain.svelte";
  import SpeechTest from "../Trainer/src_speech/components/test/SpeechTest.svelte";
  import SpeechConvert from "../Trainer/src_speech/components/convert/SpeechConvert.svelte";
  
  //비젼
  import VisionSettings from "../Trainer/src_vision/components/settings/VisionSettings.svelte";
  import VisionCapture from "../Trainer/src_vision/components/capture/VisionCapture.svelte";
  import VisionTrain from "../Trainer/src_vision/components/train/VisionTrain.svelte";
  import VisionTest from "../Trainer/src_vision/components/test/VisionTest.svelte";
  import VisionConvert from "../Trainer/src_vision/components/convert/VisionConvert.svelte";

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
    
  <!-- mask 페이지 -->
  <Route path="/mask-connect"><MASKConnect /></Route>
  <Route path="/mask-choose"><MASKChoose /></Route>
  <Route path="/mask-experience"><MASKExperience /></Route>
  
  <!-- mole 페이지 -->
  <Route path="/mole-connect"><MOLEConnect /></Route>
  <Route path="/mole-choose"><MOLEChoose /></Route>
  <Route path="/mole-experience"><MOLEExperience /></Route>


    <!-- motion -->
    <Route path="/motion-start"><Trainer_Start /></Route>
    <Route path="/motion-settings"><Trainer_Main><MotionSettings/></Trainer_Main></Route>    
    <Route path="/motion-capture"><Trainer_Main><MotionCapture/></Trainer_Main></Route>
    <Route path="/motion-train"><Trainer_Main><MotionTrain/></Trainer_Main></Route>
    <Route path="/motion-test"><Trainer_Main><MotionTest/></Trainer_Main></Route>
    <Route path="/motion-convertSend"><Trainer_Main><MotionConvert/></Trainer_Main></Route>
    <!-- <Route path="/motion-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route> -->

    <!-- speech -->
    <Route path="/speech-start"><Trainer_Start /></Route>
    <Route path="/speech-settings"><Trainer_Main><SpeechSettings/></Trainer_Main></Route>
    <Route path="/speech-capture"><Trainer_Main><SpeechCapture/></Trainer_Main></Route>
    <Route path="/speech-train"><Trainer_Main><SpeechTrain/></Trainer_Main></Route>
    <Route path="/speech-test"><Trainer_Main><SpeechTest/></Trainer_Main></Route>
    <Route path="/speech-convertSend"><Trainer_Main><SpeechConvert/></Trainer_Main></Route>
    <!-- <Route path="/motion-mem-test"><Trainer_Main><Speech_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Speech_LabelDeleteTest /></Trainer_Main></Route> -->

    <!-- vision -->
    <Route path="/vision-start"><Trainer_Start /></Route>
    <Route path="/vision-settings"><Trainer_Main><VisionSettings/></Trainer_Main></Route>
    <Route path="/vision-capture"><Trainer_Main><VisionCapture/></Trainer_Main></Route>
    <Route path="/vision-train"><Trainer_Main><VisionTrain/></Trainer_Main></Route>
    <Route path="/vision-test"><Trainer_Main><VisionTest/></Trainer_Main></Route>
    <Route path="/vision-convertSend"><Trainer_Main><VisionConvert/></Trainer_Main></Route>
    <!-- <Route path="/motion-mem-test"><Trainer_Main><Speech_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Speech_LabelDeleteTest /></Trainer_Main></Route> -->


    <!--예제용 모델 학습하기 ( fui ) -->
    <Route path="/FUI-start"><Trainer_Start /></Route>
    <Route path="/FUI-settings"><Trainer_Main><MotionSettings/></Trainer_Main></Route>    
    <Route path="/FUI-capture"><Trainer_Main><MotionCapture/></Trainer_Main></Route>
    <Route path="/FUI-train"><Trainer_Main><MotionTrain/></Trainer_Main></Route>
    <Route path="/FUI-test"><Trainer_Main><MotionTest/></Trainer_Main></Route>
    <Route path="/FUI-convertSend"><Trainer_Main><MotionConvert/></Trainer_Main></Route>
    <!-- <Route path="/FUI-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/FUI-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route> -->

    <!--예제용 모델 학습하기 ( mole ) -->
    <Route path="/MOLE-start"><Trainer_Start /></Route>
    <Route path="/MOLE-settings"><Trainer_Main><SpeechSettings/></Trainer_Main></Route>    
    <Route path="/MOLE-capture"><Trainer_Main><SpeechCapture/></Trainer_Main></Route>
    <Route path="/MOLE-train"><Trainer_Main><SpeechTrain/></Trainer_Main></Route>
    <Route path="/MOLE-test"><Trainer_Main><SpeechTest/></Trainer_Main></Route>
    <Route path="/MOLE-convertSend"><Trainer_Main><SpeechConvert/></Trainer_Main></Route>
    <!-- <Route path="/FUI-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/FUI-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route> -->
    
    <!--예제용 모델 학습하기 ( mask ) -->
    <Route path="/MASK-start"><Trainer_Start /></Route>
    <Route path="/MASK-settings"><Trainer_Main><VisionSettings/></Trainer_Main></Route>    
    <Route path="/MASK-capture"><Trainer_Main><VisionCapture/></Trainer_Main></Route>
    <Route path="/MASK-train"><Trainer_Main><VisionTrain/></Trainer_Main></Route>
    <Route path="/MASK-test"><Trainer_Main><VisionTest/></Trainer_Main></Route>
    <Route path="/MASK-convertSend"><Trainer_Main><VisionConvert/></Trainer_Main></Route>
    <!-- <Route path="/FUI-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/FUI-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route> -->
</Router>
