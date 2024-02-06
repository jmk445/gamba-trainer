<script>
    import Prompt from "./Prompt.svelte";
    export let onClose = () => {};
</script>

<Prompt title="Flow" closePrompt={onClose}>
    <div class="inner">
        <div class="bg"><p>웹사이트의 전체적인 흐름입니다.</p></div>
    </div>
</Prompt>

<style lang="scss">
    .inner {
        position: relative;
        // text-align: center;
        z-index: 1;
        max-width: 1132px;
        padding: 18px 92px;
    }
</style>
