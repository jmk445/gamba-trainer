<script>
    import { onMount } from "svelte";
    import { clearPersistantStorage } from "../../stores/aggregatedActions";
    import { navigate } from "svelte-routing";

    onMount(() => {
        clearPersistantStorage();
        navigate("motion-settings", { replace: false });
    });
</script>