<script>
    import { onMount } from "svelte";
    //todo : 통합하기
    import { clearPersistantStorageMotion } from "../../src_motion/stores/aggregatedActions";
    import { clearPersistantStorageSpeech } from "../../src_speech/stores/aggregatedActions";
    
    import { navigate } from "svelte-routing";
    import { getTrainerADD } from "../../stores/actions";

    let trainer; //= asyncgetTrainerADD();
    onMount(async()=>{
        trainer = await getTrainerADD();
        if(trainer == "motion"){
            clearPersistantStorageMotion();
        }else if(trainer == "speech"){
            clearPersistantStorageSpeech();
            console.log("hello");
        }        
        navigate(`/${trainer}-settings`, { replace: false });
    })
    
</script>