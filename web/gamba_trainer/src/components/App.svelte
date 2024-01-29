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
  import Main from "./main/main.svelte";
  import Train_Select from "../Trainer/components/main/Select.svelte"

  // import Trainer_Start from "../Trainer/src_motion/components/dev/Start.svelte"
  // import Trainer_Capture from "../Trainer/src_motion/components/capture/Capture.svelte";
  // import Trainer_Main from "../Trainer/common/TrainerMain.svelte";
  // import Trainer_Settings from "../Trainer/src_motion/components/settings/Settings.svelte";
  // import Trainer_Test from "../Trainer/src_motion/components/test/Test.svelte";
  // import Trainer_Train from "../Trainer/src_motion/components/train/Train.svelte";

    import Trainer_Start from "../Trainer/src_motion/components/dev/Start.svelte"
  import Trainer_Capture from "../Trainer/common/TrainerCapture.svelte";
  import Trainer_Main from "../Trainer/common/TrainerMain.svelte";
  import Trainer_Settings from "../Trainer/common/TrainerSettings.svelte";
  import Trainer_Test from "../Trainer/common/TrainerTest.svelte";
  import Trainer_Train from "../Trainer/common/TrainerTrain.svelte";
  import Trainer_convert from "../Trainer/common/TrainerConvert.svelte";

  import Motion_MemoryTest from "../Trainer/src_motion/components/dev/MemoryTest.svelte";
  import Motion_LabelDeleteTest from "../Trainer/src_motion/components/dev/LabelDeleteTest.svelte";
  import Motion_ConvertSend from "../Trainer/src_motion/components/convert/ConvertSend.svelte";

  import MotionSettings_Capture from "../Trainer/src_motion/components/settings/motionSettings_capture.svelte";
  import MotionCapture_Label from "../Trainer/src_motion/components/capture/MotionCapture_label.svelte";
  import MotionCapture_List from "../Trainer/src_motion/components/capture/MotionCapture_list.svelte";
  import MotionTrain_Setting from "../Trainer/src_motion/components/train/MotionTrain_setting.svelte";
  import MotionTrain_Graph from "../Trainer/src_motion/components/train/MotionTrain_graph.svelte";
  import MotionTest_Progress from "../Trainer/src_motion/components/test/MotionTest_progress.svelte";

  import FuiConnect from "../Application/FUI/FUIConnect.svelte";
  import FuiChoose from "../Application/FUI/FUIChoose.svelte";
  // import FuiExplanation from "../Application/FUI/FUIExplanation.svelte";
  import FuiExperience from "../Application/FUI/FUIExperience.svelte";
  
  // import Speech_Start from "../Trainer/src_speech/components/dev/Start.svelte";
  // import Speech_Capture from "../Trainer/src_speech/components/capture/Capture.svelte";
  // import Speech_Main from "../Trainer/src_speech/components/main/Main.svelte";
  // import Speech_Test from "../Trainer/src_speech/components/test/Test.svelte";
  // import Speech_Train from "../Trainer/src_speech/components/train/Train.svelte";
  // import Speech_MemoryTest from "../Trainer/src_speech/components/dev/MemoryTest.svelte";
  // import Speech_LabelDeleteTest from "../Trainer/src_speech/components/dev/LabelDeleteTest.svelte";
  
  // import Vision_Start from "../Trainer/src_vision/components/dev/Start.svelte";
  // import Vision_Capture from "../Trainer/src_vision/components/capture/Capture.svelte";
  // import Vision_Main from "../Trainer/src_vision/components/main/Main.svelte";
  // import Vision_Test from "../Trainer/src_vision/components/test/Test.svelte";
  // import Vision_Train from "../Trainer/src_vision/components/train/Train.svelte";
  // import Vision_MemoryTest from "../Trainer/src_vision/components/dev/MemoryTest.svelte";
  // import Vision_LabelDeleteTest from "../Trainer/src_vision/components/dev/LabelDeleteTest.svelte";

  // import Template_Start from "../src_template/components/dev/Start.svelte";
  // import Template_Capture from "../src_template/components/capture/Capture.svelte";
  // import Template_Main from "../src_template/components/main/Main.svelte";
  // import Template_Settings from "../src_template/components/settings/Settings.svelte";
  // import Template_Test from "../src_template/components/test/Test.svelte";
  // import Template_Train from "../src_template/components/train/Train.svelte";
  // import Template_MemoryTest from "../src_template/components/dev/MemoryTest.svelte";
  // // import Template_ErrorMessage from "../src_template/components/general/ErrorMessage.svelte";
  // import Template_LabelDeleteTest from "../src_template/components/dev/LabelDeleteTest.svelte";

  import App_Select from "../Application/components/main/Main.svelte";
  import MotionApps from "../Application/components/main/MotionApps.svelte";
  import SpeechApps from "../Application/components/main/SpeechApps.svelte";
  import VisionApps from "../Application/components/main/VisionApps.svelte";
    import MotionCaptureLabel from "../Trainer/src_motion/components/capture/MotionCapture_label.svelte";
  export let url = "";
  const basepath = BASE_PATH === "" ? "/" : BASE_PATH;
</script>

<Router {url} {basepath}>
  <!-- <main> -->
    <Route path="/"><Main /></Route>
    <Route path="/train-select"><Train_Select /></Route>
  <Route path="/motionApps-select"><App_Select><MotionApps/></App_Select></Route>
  <Route path="/speechApps-select"><App_Select><SpeechApps/></App_Select></Route>
  <Route path="/visionApps-select"><App_Select><VisionApps/></App_Select></Route>

  <!-- <Route path="/fui-connect"><p>1st</p><FuiConnect/></Route> -->
  <Route path="/fui-connect"><FuiConnect/></Route>
  <Route path="/fui-choose"><FuiChoose/></Route>
  <!-- <Route path="/fui-explanation"><FuiExplanation/></Route> -->
  <Route path="/fui-experience"><FuiExperience/></Route>
    <!-- <Route path="/motion-start"><Trainer_Start /></Route>
    <Route path="/motion-settings"><Trainer_Main><Trainer_Settings /></Trainer_Main></Route>    
    <Route path="/motion-capture"><Trainer_Main><Trainer_Capture /></Trainer_Main></Route>
    <Route path="/motion-train"><Trainer_Main><Trainer_Train /></Trainer_Main></Route>
    <Route path="/motion-test"><Trainer_Main><Trainer_Test /></Trainer_Main></Route>
    <Route path="/motion-convertSend"><Trainer_Main><Motion_ConvertSend /></Trainer_Main></Route>
    <Route path="/motion-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route> -->

    <Route path="/motion-start"><Trainer_Start /></Route>
    <Route path="/motion-settings"><Trainer_Main><Trainer_Settings><MotionSettings_Capture slot="settings-capture"/></Trainer_Settings></Trainer_Main></Route>    
    <Route path="/motion-capture"><Trainer_Main><Trainer_Capture><MotionCapture_Label slot="capture-label"/><MotionCapture_List slot="capture-list"/></Trainer_Capture></Trainer_Main></Route>
    <Route path="/motion-train"><Trainer_Main><Trainer_Train><MotionTrain_Setting slot="train-setting"/><MotionTrain_Graph slot="train-graph"/></Trainer_Train></Trainer_Main></Route>
    <Route path="/motion-test"><Trainer_Main><Trainer_Test><MotionTest_Progress slot="test-progress"/></Trainer_Test></Trainer_Main></Route>
    <Route path="/motion-convertSend"><Trainer_Main><Trainer_convert/></Trainer_Main></Route>
    <Route path="/motion-mem-test"><Trainer_Main><Motion_MemoryTest /></Trainer_Main></Route>
    <Route path="/motion-label-test"><Trainer_Main><Motion_LabelDeleteTest /></Trainer_Main></Route>

  <!-- </main> -->
</Router>

<style lang="scss">
  main {
    height: 100vh;
  }
</style>



