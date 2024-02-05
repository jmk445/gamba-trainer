<script>
    import { onMount } from "svelte";
    import { clearPersistantStorage } from "@speech/stores/aggregatedActions";
    import { navigate } from "svelte-routing";

    onMount(() => {
        clearPersistantStorage();
        navigate("speech-capture", { replace: false });
    });
</script>