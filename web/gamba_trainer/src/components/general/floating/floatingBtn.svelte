<script>
    import FlowFrompt from "../prompts/FlowFrompt.svelte";
    let showFlow = false;

</script>

<div>
    {#if showFlow}
        <FlowFrompt onClose={() => (showFlow = false)}/>
    {/if}
    <button class="btn-floating" on:click={()=>showFlow = true}>~</button>

</div>
<style lang="scss">
    @import "@scss/vars";

    .btn-floating{
        position: fixed;
    bottom: 24px;
    right: 24px;
    height: 48px;
    font-size: 2rem;
    color: white;
    width: 48px;
    background-color: white;
    border: 3px solid $color-deepblue;
    color: $color-deepblue;
    border-radius: 50%;
    box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.5);
    z-index: 3;
    }
</style>