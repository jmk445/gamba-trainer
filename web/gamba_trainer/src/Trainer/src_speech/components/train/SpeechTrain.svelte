<script>
    import NumberInput from "../../../../general/NumberInput.svelte";
    import GraphContainer from "./GraphContainer.svelte";
    import TrainerTrain from "../../../components/common/TrainerTrain.svelte";
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

  const strAsset = {
    epochs : "Epochs",
    accuracy : "정확도",
    accuracyTrain : "학습 정확도",
    accuracyValidation : "검증 정확도",
    loss : "손실",
    lossTrain : "학습 손실",
    lossValidation : "검증 손실"
  }

</script>
<TrainerTrain>
    <div class="row" slot="train-setting">
<div class="column">
    <NumberInput
      name="input_epochs"
      classStr="subhead-1"
      bind:value={$trainEpochs}
      min={1}
    /><label class="subhead-1" for="input_epochs">{strAsset.epochs}</label>
  </div>
  <div class="column">
    <EarlyStopping />
  </div>
</div>

<div slot="train-graph">
  <div class="graph-container-contents">
  <GraphContainer
    title={strAsset.accuracy}
    label1={strAsset.accuracyTrain}
    label2={strAsset.accuracyValidation}
    decimals={2}
    maxX={$trainEpochs}
    data={[$trainLogAccuracy.train, $trainLogAccuracy.validation]}
  />
  <GraphContainer
    title={strAsset.loss}
    label1={strAsset.lossTrain}
    label2={strAsset.lossValidation}
    decimals={4}
    maxX={$trainEpochs}
    data={[$trainLogLoss.train, $trainLogLoss.validation]}
  />
  </div>
</div>
</TrainerTrain>
  <style lang="scss">
      @import "@scss/vars";
  label {
    margin-right: 40px;
  }

  .graph-container-contents {
    display: flex;
    justify-content: space-between;
    gap: 6%;
    width: 100%;
  }
  </style>