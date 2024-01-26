<script>
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
</script>

<div class="panel">
  <div>
    <h2>Capturing threshold</h2>
    <p>
      기록을 시작하는 최소 동작입니다. 임계값 이상의 동작이 감지되면 기록이
      시작됩니다. 해당값은 모델에 의해 샘플 근사화에 사용됩니다.
    </p>
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
    <h2>Number of samples</h2>
    <p>
      기록은 초당 약 100개의 샘플로 이루어집니다. 더 적은 수의 샘플을 선택하면
      움직임 데이터를 캡처하는 과정이 빨라질 것입니다.
    </p>
  </div>
  <div class="form-container input-align-right">
    <SettingsInput
      name="number-of-samples"
      value={$captureSamples}
      label="Number of samples to record"
      onChange={(value) => checkForRecordings(captureSamples, value)}
      min={minMaxValues.captureSamples[0]}
      max={minMaxValues.captureSamples[1]}
      step={1}
    />
  </div>
</div>

<div class="panel">
  <div>
    <h2>Delay between captures(seconds)s</h2>
    <p>
      한 기록이 완료된 후 다른 기록을 허용하기 전에 대기할 시간을 초 단위로
      제공합니다. 이는 이중 트리거링을 방지하기 위한 것입니다.
    </p>
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
    margin-bottom: 50px;

    div:first-child {
      width: 34%;

      h2 {
        margin-bottom: 20px;
      }
    }

    div:last-child {
      width: 62%;
    }
  }
</style>
