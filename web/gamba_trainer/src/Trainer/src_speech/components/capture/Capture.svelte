<script>
  import CaptureList from "./CaptureList.svelte";

  import TextInput from "../../../../components/general/TextInput.svelte";
  import { addLabel, getLabelCnt } from "../../stores/capture/actions";
  import { clearAllLabel } from "../../stores/capture/actions";
  import { labels } from "../../stores/capture/store";
  import {onMount} from "svelte";
  import { getTrainerADD } from "../../../stores/actions";
  import TrainerCapture from "../../../components/common/TrainerCapture.svelte";
  let newLabelName = "";
  let newLabelError = null;
  let trainer;
  let isApplicationMode = false;
  $: if ($labels.includes(newLabelName)) {
      newLabelError = strAsset.labelUnique;
  } else {
      newLabelError = "";
  }

  function handleAddLabel() {
      newLabelError = null;
      if (newLabelName.length > 0) {
          try {
              addLabel(newLabelName);
              newLabelName = "";
          } catch (e) {
              newLabelError = e.toString();
          }
      }
  }

  
  onMount(async () => {
        trainer = await getTrainerADD();
        console.log("trainer");

        if (trainer == "MOLE") {
            clearAllLabel();
            isApplicationMode = true;
            strAsset.inputLabel = "고정된 라벨입니다.";
            console.log("hhhhhhhhhhhhh");
            addLabel("up");            
            addLabel("down");
            addLabel("left");
            addLabel("right");            
        }
    });

  const strAsset = {
      inputLabel : "라벨의 이름을 입력하세요",
      inputLabel2: "고정된 라벨입니다.",
      btnCreate : "생성하기",
      labelUnique : "똑같은 이름의 라벨이 있습니다."
  }
</script>
<TrainerCapture>
  <div class="row" slot="capture-label">
<TextInput
label={isApplicationMode
  ? strAsset.inputLabel2
  : strAsset.inputLabel}
  bind:value={newLabelName}
  onEnter={handleAddLabel}
  errorMessage={newLabelError}
  isdisabled={isApplicationMode}
/>
<button
  class="btn-stroke primary"
  disabled={newLabelName.length === 0 || newLabelError}
  on:click={handleAddLabel}>{strAsset.btnCreate}</button
>
</div>
<div slot="capture-list">
  <CaptureList />
</div>
</TrainerCapture>

<style lang="scss">
button {
  margin-left: 1rem;
}
</style>