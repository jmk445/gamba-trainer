<script>
    import { onMount } from "svelte";
    import { clearPersistantStorage } from "@vision/stores/aggregatedActions";
    import { navigate } from "svelte-routing";

    onMount(() => {
        clearPersistantStorage();
        navigate("speech-capture", { replace: false });
    });
</script>