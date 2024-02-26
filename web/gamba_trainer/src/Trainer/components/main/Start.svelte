<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { getTrainerADD } from "../../stores/actions";
    

    let trainer, trainer_;
    let aggregatedActions;    

    onMount(async () => {
        trainer = await getTrainerADD();
        trainer_ = trainer;

        //@todo : needs update
        if (trainer == "FUI") {
            trainer_ = "motion";
        }
        if (trainer == "MOLE") {
            trainer_ = "speech";
        }
        if (trainer == "MASK") {
            trainer_ = "vision";
        }
        //@todo : needs update
        await import(`../../src_${trainer_}/stores/aggregatedActions`).then(
            (module) => {
                aggregatedActions = module;
            },
        );
        aggregatedActions.clearPersistantStorage();

        navigate(`/${trainer}-settings`, { replace: true });
    });
    
</script>
