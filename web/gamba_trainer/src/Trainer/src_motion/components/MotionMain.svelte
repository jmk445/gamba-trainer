<script>
    import { onMount } from "svelte";
      
    import SubBanner from "../../common/SubBanner.svelte";
    import SubNav from "./MainNav.svelte";
    import MainNav from "./MainNav.svelte";
  
    import UnsavedProjectPrompt from "../../general/prompts/UnsavedProjectPrompt.svelte";
    import LocalStorageFullPrompt from "../../general/prompts/LocalStorageFullPrompt.svelte";
    import DownloadModelPrompt from "../../general/prompts/DownloadModelPrompt.svelte";  
  
    import { promptStack } from "../src_motion/stores/ui/store";
    import { pushErrorMessage, pushPropmt } from "../src_motion/stores/ui/actions";
    import persistStore, { dirty } from "../src_motion/stores/utils/persistStore";
  
    onMount(() => {
      persistStore.onError((error) => {
        if (error.name === "LocalStorageError") {
          pushPropmt("localstorage_full");
        } else if (error.name === "DeserializeError") {
          pushErrorMessage(
            "Something went wrong. Please check the console for more details.",
          );
        } else {
          pushErrorMessage(error.message);
        }
      });
    });
  </script>
<header>
    <SubBanner title="Motion Trainer" />
    <SubNav />
    <MainNav trainer="motion" />
</header>
<main class="section" aria-live="polite">
    <slot />
</main>
