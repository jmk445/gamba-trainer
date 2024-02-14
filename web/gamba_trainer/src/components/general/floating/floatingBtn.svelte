<script>
    import FlowFrompt from "../prompts/FlowFrompt.svelte";
    import icFlow from "../../../assets/img/ic_flow.svg";
    let showFlow = false;

</script>

<div>
    {#if showFlow}
        <FlowFrompt onClose={() => (showFlow = false)}/>
    {/if}
    <button class="btn-floating" on:click={()=>showFlow = true}><img src={icFlow} alt="개요"/><p>개요</p> </button>

</div>
<style lang="scss">
    @import "@scss/vars";

    .btn-floating{
        position: fixed;
    bottom: 24px;
    right: 24px;
    height: 48px;
    width: 48px;
    height: 48px;
    // color: white;
    // width: 48px;
    padding:4px ;
    font-size: 0.875rem;
    background-color: white;
    border: 3px solid $color-deepblue;
    color: $color-deepblue;
    border-radius: 50%;
    box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.5);
    z-index: 2;
    img{
        width: 24px;
    }
    p{
        display: none;
    }
    &:hover{
        img{
            display: none;
        }
        p{
            display: block;
        }
        background-color: $color-deepblue;
        border: none;
        color: white;
    }
    }
</style>