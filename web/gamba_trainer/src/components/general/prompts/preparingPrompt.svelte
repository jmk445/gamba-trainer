<script>
    import Prompt from "./Prompt.svelte";
    export let onClose = () => {};
</script>

<Prompt title="준비 중" closePrompt={onClose}>
    <div class="inner">
        <div class="bg"><p>서비스를 준비 중입니다.</p></div>
    </div>
</Prompt>

<style lang="scss">
    .inner {
        position: relative;
        // text-align: center;
        z-index: 1;
        max-width: 1132px;
        padding: 64px 64px;
    }
</style>
