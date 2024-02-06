<script>
    import HelpPrompt from "../general/prompts/HelpPrompt.svelte";
    export let title;
    export let explanation;
    export let pageNum;
    let showHelpPrompt = false;
</script>

<div class="description">
    <div class="title-container">
    <h2>{title}</h2>
    <button class="btn-help" on:click={()=>{showHelpPrompt=true}}>?</button>
    </div>
    <p>{explanation}</p>
</div>
{#if showHelpPrompt}
    <HelpPrompt pageNum={pageNum} onClose={() => (showHelpPrompt = false)}/>
{/if}
<style lang="scss">
    @import "@scss/vars";

    .description {
        padding: 48px 32px;
        background-color: $color-lightsky;
        border-radius: 8px;
        margin-bottom: 64px;

        h2 {
            margin-bottom: 16px;
            font-size: 2.25rem;
            font-weight: 500;
        }
    }
    .title-container{
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .btn-help{
        @import "@scss/vars";

        margin-left: 12px;
        width: 20px;
        height: 20px;
        background-color: white;
        color: $color-deepblue;
        border-radius: 50%;
    }
</style>
