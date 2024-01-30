<script>
  import {
    trainEarlyStopping,
    trainEarlyStoppingMaxEpochsWithoutImprovement,
    trainEarlyStoppingMinAccuracy,
  } from "../../stores/train/store";
  import CheckboxInput from "../../../../general/CheckboxInput.svelte";

  import NumberInput from "../../../../general/NumberInput.svelte";
  const strAsset = {
    epochs : "Epochs",
    checkEarly : "early stopping 사용",
    inputMax : "회 성능개선이 없을 경우 중단",
    inputMin : "최소 정확도"
  }
</script>

<CheckboxInput
  name="input_early_stopping_motion"
  bind:value={$trainEarlyStopping}
/><label class="subhead-1" for="input_early_stopping_motion">{strAsset.checkEarly}</label>

{#if $trainEarlyStopping}
  <div class="input-container">
    <NumberInput
      classStr="subhead-1"
      name="early_stopping_epochs"
      label="Number of epochs before stopping"
      bind:value={$trainEarlyStoppingMaxEpochsWithoutImprovement}
      min={1}
    /><label class="subhead-1" for="early_stopping_epochs">{strAsset.epochs}</label>
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
</style>
