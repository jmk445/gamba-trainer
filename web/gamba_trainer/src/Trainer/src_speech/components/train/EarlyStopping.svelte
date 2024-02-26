<script>
  import {
    trainEarlyStopping,
    trainEarlyStoppingMaxEpochsWithoutImprovement,
    trainEarlyStoppingMinAccuracy,
  } from "../../stores/train/store";
  import CheckboxInput from "../../../../components/general/CheckboxInput.svelte";

  import NumberInput from "../../../../components/general/NumberInput.svelte";
  const strAsset = {
    epochs: "Epochs",
    checkEarly: "early stopping 사용",
    inputMax: "회 성능개선이 없을 경우 중단",
    inputMin: "최소 정확도",
    toolTip: "모델이 일정한 수준으로 교육되면, 모델 교육을 일찍 마칩니다.",
  };
</script>

<div class="check-box row">
  <span class="tool-tip">{strAsset.toolTip}</span>
  <div class="column">
  <CheckboxInput
    name="input_early_stopping_motion"
    bind:value={$trainEarlyStopping}
  /><label class="subhead-1" for="input_early_stopping_motion"
    >{strAsset.checkEarly}</label
  >
</div>
</div>
{#if $trainEarlyStopping}
  <div class="input-container">
    <NumberInput
      classStr="subhead-1"
      name="early_stopping_epochs"
      label="Number of epochs before stopping"
      bind:value={$trainEarlyStoppingMaxEpochsWithoutImprovement}
      min={1}
    /><label class="subhead-1" for="early_stopping_epochs"
      >{strAsset.epochs}</label
    >
    <span class="helper-text notation-text">{strAsset.inputMax}</span>
  </div>
  <div class="input-container">
    <NumberInput
      classStr="subhead-1"
      name="early_stopping_min_acc"
      label="Early stopping (epochs)"
      bind:value={$trainEarlyStoppingMinAccuracy}
      min={1}
      max={100}
    /><label class="subhead-1" for="early_stopping_min_acc"> %</label>
    <span class="helper-text notation-text">{strAsset.inputMin}</span>
  </div>
{/if}

<style lang="scss">
  label {
    margin-right: 40px;
  }

  .input-container {
    position: relative;
  }
  .helper-text {
    position: absolute;
    left: 0;
    bottom: -1.24rem;
  }

  .check-box {
    position: relative;
  }
  .tool-tip {
    display: none;
    position: absolute;
    left: -8px;
    bottom: 28px;
    border-radius: 8px;
    background-color: black;
    opacity: 0.5;
    color: white;
    padding: 8px;
    word-break: keep-all;
    font-weight: 400;
    font-size: 0.875rem;
    width: 352px;

    &::after{
      border-bottom: 0px solid transparent;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid black;
      content: "";
      position: absolute;
      bottom: -8px;
      left: 8px;
    }
  }
  .check-box:hover .tool-tip {
    display: block;
  }
</style>
