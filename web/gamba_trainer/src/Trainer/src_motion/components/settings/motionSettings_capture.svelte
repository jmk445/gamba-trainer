<!-- <script>
  import SettingsInput from "./SettingsInput.svelte";
  import { hasRecordings } from "../../stores/capture/store";
  import {
    captureDelay,
    captureSamples,
    captureThreshold,
    minMaxValues,
  } from "../../stores/captureSettings/store";
  let clearRecordPrompt;
  async function checkForRecordings(store, value) {
    if ($hasRecordings) {
      clearRecordPrompt.show((didClear) => {
        if (didClear) {
          store.set(value);
        } else {
          const prevValue = get(store);
          store.set(value);

          setTimeout(() => {
            store.set(prevValue);
          }, 10);
        }
      });
    } else {
      store.set(value);
    }
  }
  const strAsset = {
    panelOne: "임계값 설정",
    panelOneDesc:
      "기록을 시작하는 최소 동작입니다. 임계값 이상의 동작이 감지되면 기록이 시작됩니다. 해당값은 모델에 의해 샘플 근사화에 사용됩니다.",
    panalTwo: "다음 수집까지 대기시간(초)",
    panelTwoDesc:
      "한 기록이 완료된 후 다른 기록을 허용하기 전에 대기할 시간을 초단위로 제공합니다. 이는 이중 트리거링을 방지하기 위한 것입니다."
  };
</script>

<div class="panel">
  <div>
    <h2>{strAsset.panelOne}</h2>
    <p>{strAsset.panelOneDesc}</p>
  </div>
  <div class="form-container input-align-right">
    <SettingsInput
      name="capturing-threshold"
      value={$captureThreshold}
      label="Capture threshold"
      onChange={(value) => checkForRecordings(captureThreshold, value)}
      min={minMaxValues.captureThreshold[0]}
      max={minMaxValues.captureThreshold[1]}
      step={0.001}
    />
  </div>
</div>


<div class="panel">
  <div>
    <h2>{strAsset.panalTwo}</h2>
    <p>{strAsset.panelTwoDesc}</p>
  </div>
  <div class="form-container input-align-right">
    <SettingsInput
      name="delay-between-captures"
      value={$captureDelay}
      label="Delay in seconds between captures"
      onChange={(value) => checkForRecordings(captureDelay, value)}
      min={minMaxValues.captureDelay[0]}
      max={minMaxValues.captureDelay[1]}
      step={0.001}
    />
  </div>
</div>

<style lang="scss">
  .panel {
    display: flex;
    justify-content: space-between;
    &:first-child {
      margin-bottom: 42px;
    }

    div:first-child {
      width: 40%;

      h2 {
        margin-bottom: 12px;
      }
    }

    div:last-child {
      width: 56%;
    }
  }
</style> -->
