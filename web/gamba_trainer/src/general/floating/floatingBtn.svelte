<script>
    import HelpSettings from "./HelpSettings.svelte";

</script>

<div>
    {#if isBg===true}
        <HelpSettings/>
    {/if}
    <button class="btn-floating">?</button>

</div>
<style lang="scss">
    @import "@scss/vars";

    .btn-floating{
        position: fixed;
    bottom: 24px;
    right: 24px;
    height: 64px;
    font-size: 3rem;
    color: white;
    width: 64px;
    background-color: #386dff;
    border-radius: 50%;
    box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.5);
    z-index: 3;
    }
</style>