<script>
  import GraphContainer from "./GraphContainer.svelte";
  import {
    trainEpochs,
    trainingState,
    trainIsUnlocked,
    trainLogAccuracy,
    trainLogLoss,
  } from "../../stores/train/store";

  const strAsset = {
    accuracy : "정확도",
    accuracyTrain : "학습 정확도",
    accuracyValidation : "검증 정확도",
    loss : "손실",
    lossTrain : "학습 손실",
    lossValidation : "검증 손실"
  }
</script>
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
<style lang="scss">
  .graph-container-contents{
    display: flex;
    justify-content: space-between;
    gap: 6%;
    width: 100%;
  }
</style>