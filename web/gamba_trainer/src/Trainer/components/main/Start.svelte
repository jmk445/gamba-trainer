<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { getTrainerADD } from "../../stores/actions";
    import { addLabel, getLabelCnt } from "../../src_motion/stores/capture/actions";
    let trainer, trainer_;
    let aggregatedActions;

    onMount(async () => {
        trainer = await getTrainerADD();
        trainer_ = trainer;

        console.log(trainer);
        
        //@todo needs update
        if (trainer == "FUI") {
            trainer_ = "motion";
        }

        console.log(trainer_);

        await import(`../../src_${trainer_}/stores/aggregatedActions`).then(
            (module) => {
                aggregatedActions = module;
            },
        );
        // aggregatedActions.clearPersistantStorage();

        if (trainer != "speech") {
            addLabel("left");
            addLabel("right");

            console.log("hello");
        }

        navigate(`/${trainer}-settings`, { replace: true });
    });
</script>
