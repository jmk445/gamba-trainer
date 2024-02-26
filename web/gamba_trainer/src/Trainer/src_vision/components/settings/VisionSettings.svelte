<script>
    import SettingsInput from "./SettingsInput.svelte";
    import { get } from "svelte/store";
    import TrainerSettings from "../../../components/common/TrainerSettings.svelte";
    import ChangeAfterRecordPrompt from "./ChangeAfterRecordPrompt.svelte";
    import { hasRecordings } from "../../stores/capture/store";
    
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
  
    function handleCloseChangeAfterRecordPrompt(didClear) {}
  
  </script>
  <TrainerSettings>

  </TrainerSettings>
  <ChangeAfterRecordPrompt
      onClose={handleCloseChangeAfterRecordPrompt}
      bind:this={clearRecordPrompt}
  />
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
  </style>
  