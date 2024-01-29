

<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { isConnected } from "@motion/stores/bleInterfaceStore/store";
  import { labels } from "@motion/stores/capture/store";
  import { beginTesting, endTesting } from "@motion/stores/test/actions";
  import { testIsUnlocked, testPredictions } from "@motion/stores/test/store";
  import { isFullyLoaded } from "@motion/stores/ui/store";
  import LinearProgress from "../../../../general/LinearProgress.svelte";
  import Description from "../../../../common/Description.svelte";

  onMount(async () => {
    let unsubFromConnect;
    let isDestroyed = false;
    setTimeout(async () => {
      if ($isConnected) {
        await beginTesting();
      } else {
        unsubFromConnect = isConnected.subscribe(async ($isConnected) => {
          if ($isConnected) {
            if (!isDestroyed) {
              await beginTesting();
            }
            unsubFromConnect();
          }
        });
      }
    }, 100);

    return () => {
      isDestroyed = true;
      if (unsubFromConnect) {
        unsubFromConnect();
      }
      endTesting();
    };
  });

  $: if ($isFullyLoaded) {
    if (!$testIsUnlocked) {
      navigate(BASE_PATH, { replace: true });
    }
  }
</script>

{#each $labels as label, index}
<div class="panel">
  <div>
    <span class="label">{label}</span><span class="result"
      >{Math.round(
        !$testPredictions ? 0 : $testPredictions[index] * 100
      )}%</span>
  </div>
  <LinearProgress
    progress={!$testPredictions ? 0 : $testPredictions[index]}
  />
</div>
{/each}

<style lang="scss">
    .panel{
      margin-bottom: 60px;
    }
    .panel > div {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .label {
      font-size: 16px;
      font-weight: 400;
      margin-bottom: 10px;
    }
  </style>