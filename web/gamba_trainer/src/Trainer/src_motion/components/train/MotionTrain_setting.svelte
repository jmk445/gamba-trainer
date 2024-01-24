<script>
    import NumberInput from "../../../../general/NumberInput.svelte";
    import {
    trainEpochs,
    trainingState,
    trainIsUnlocked,
    trainLogAccuracy,
    trainLogLoss,
  } from "../../stores/train/store";
  $: if ($isFullyLoaded) {
    if (!$trainIsUnlocked) {
      navigate(BASE_PATH, { replace: true });
    }
  }
  import { isFullyLoaded } from "../../stores/ui/store";
  import EarlyStopping from "./EarlyStopping.svelte";
</script>

<div class="column">
    <NumberInput
      name="input_epochs"
      classStr="subhead-1"
      bind:value={$trainEpochs}
      min={1}
    /><label class="subhead-1" for="input_epochs">Epochs</label>
  </div>
  <div class="column">
    <EarlyStopping />
  </div>
  <style lang="scss">
      @import "@scss/vars";
  label {
    margin-right: 40px;
  }

  </style>