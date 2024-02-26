<script>
    import Prompt from "./Prompt.svelte";
    import AppLinkModule from "../../../Application/components/main/AppLinkModule.svelte";
    import FuiThumbnail from "@assets/img/tumbnail/fuiThumbnail.png";
    import MoleThumbnail from "@assets/img/tumbnail/moleThumbnail.png";
    import MaskThumbnail from "@assets/img/tumbnail/maskThumbnail.png";
    import { onMount } from "svelte";
    import persistStore from "../../../Trainer/stores/utils/persistStore";
    // import logoPng from "@assets/icons/Symbol_Black_RGB.png";
  
    export let onClose = () => {};
    const hanleAppClick = (event) =>{
        console.log(event.detail.value.title);
        persistStore("trainerADD!", event.detail.value.title);
        onClose();
    }
    export let trainer;
    let TrainerType = null;

    onMount(()=>{
        TrainerType = trainer;
    });
    const strAsset = {
        bannerTitle : "예제 선택",
        motion : [
            {
                title : "FUI",
                caption : "손가락을 활용한 유저 인터페이스",
                tumbnail : FuiThumbnail
            }
        ],
        speech : [
            {
                title : "MOLE",
                caption : "음성을 활용한 두더지 잡기",
                tumbnail : MoleThumbnail
            }
        ],
        vision : [
            {
                title : "MASK",
                caption : "카메라를 활용한 마스크",
                tumbnail : MaskThumbnail
            }
        ]
    }
  </script>
  
  <Prompt title={strAsset.bannerTitle} closePrompt={onClose}>
    <div class="inner">
            {#if TrainerType === "motion"}
                <div class="example-contents-container">
                    {#each  strAsset.motion as app}
                        <AppLinkModule title={app.title} caption={app.caption} tumbnail={app.tumbnail} on:appClick={hanleAppClick}/>
                    {/each}
                    {#each Array(Math.max(0, 3 - strAsset.motion.length)) as i}
                    <div />
                    {/each}
                </div>
            {:else if TrainerType === "speech"}
                <div class="example-contents-container">
                    {#each  strAsset.speech as app}
                        <AppLinkModule title={app.title} caption={app.caption} tumbnail={app.tumbnail} on:appClick={hanleAppClick}/>
                    {/each}
                    {#each Array(Math.max(0, 3 - strAsset.speech.length)) as i}
                    <div />
                    {/each}
                </div>
            {:else if TrainerType === "vision"}
                <div class="example-contents-container">
                    {#each  strAsset.vision as app}
                        <AppLinkModule title={app.title} caption={app.caption} tumbnail={app.tumbnail} on:appClick={hanleAppClick}/>
                    {/each}
                    {#each Array(Math.max(0, 3 - strAsset.vision.length)) as i}
                    <div />
                    {/each}
                </div>
            {/if}
        
    </div>
  </Prompt>
  
  <style lang="scss">
  
  
    .inner {
        overflow: scroll;
        overflow-x: hidden;
        position: relative;
        text-align: center;
        z-index: 1;
        min-width: 800px;
        max-height: 580px;
        padding: 44px 90px;

    }
    .example-contents-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(184px, 1fr));
        grid-column-gap: 24px;
        grid-row-gap: 36px;
    }
  </style>