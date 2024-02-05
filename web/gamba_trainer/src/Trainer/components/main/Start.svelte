<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { getTrainerADD } from "../../stores/actions";

    let trainer;
    let aggregatedActions;

    onMount(async () => {
        trainer = await getTrainerADD();

        await import(
            `../../src_${trainer}/stores/aggregatedActions`
        ).then((module) => {
            aggregatedActions = module;
            console.log("2 " + trainer);
        });        

        aggregatedActions.clearPersistantStorage();

        navigate(`/${trainer}-settings`, { replace: false });
    });
</script>
