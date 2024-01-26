<script>
  import GraphContainer from "./GraphContainer.svelte";
  import {
    trainEpochs,
    trainingState,
    trainIsUnlocked,
    trainLogAccuracy,
    trainLogLoss,
  } from "../../stores/train/store";
</script>
<div class="graph-container-contents">
<GraphContainer
  title="Accuracy"
  label1="Train accuracy"
  label2="Validation accuracy"
  decimals={2}
  maxX={$trainEpochs}
  data={[$trainLogAccuracy.train, $trainLogAccuracy.validation]}
/>
<GraphContainer
  title="Loss"
  label1="Train loss"
  label2="Validation loss"
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