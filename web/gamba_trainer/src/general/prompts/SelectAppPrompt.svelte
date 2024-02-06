<script>
    import Prompt from "./Prompt.svelte";
    import AppLinkModule from "../../Application/components/main/AppLinkModule.svelte";
    // import persistStore from "../../Trainer/stores/utils/persistStore";
    import { onMount } from "svelte";
    // import logoPng from "@assets/icons/Symbol_Black_RGB.png";
  
    export let onClose = () => {};
    const hanleAppClick = (event) =>{
        console.log(event.detail.value.title);
        // persistStore("trainerADD!", event.detail.value.title);
        onClose();
    }
    export let trainer;
    let TrainerType = null;

    onMount(()=>{
        // console.log(trainer);
        // console.log(typeof(trainer));
        TrainerType = trainer;
    });
  </script>
  
  <Prompt title="Select Appllication" closePrompt={onClose}>
    <div class="inner">
        <div class="example-contents-container">
            {#if TrainerType === "motion"}
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
        
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
        
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="FUI" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            {:else if TrainerType === "speech"}
            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>

            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>

            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="speech app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            {:else if TrainerType === "vision"}
            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>

            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>

            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스" on:appClick={hanleAppClick}/>
            {/if}
        </div>
        
    </div>
  </Prompt>
  
  <style lang="scss">
  
  
    .inner {
        overflow: scroll;
        overflow-x: hidden;
        position: relative;
        text-align: center;
        z-index: 1;
        max-width: 800px - 60px;
        max-height: 580px;
        padding: 44px 90px;

    }
    .example-contents-container {
        display: grid;
        grid-template-columns: auto auto auto;
        grid-template-rows: 200px 200px 200px;
        gap: 60px;
    }
  </style>