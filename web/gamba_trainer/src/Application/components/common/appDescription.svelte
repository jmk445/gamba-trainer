<script>
    
    import AppMain from "./AppMain.svelte";
    export let appName;
    export let explainTitle;
    export let explainDesc;
</script>

<AppMain bannerTitle={appName.toUpperCase()} appName={appName}>
    <div class="fui-explanation-container">
        <h2>{explainTitle}</h2>
        <p>{explainDesc}</p>
        <slot name="app-desc"/>
    </div>
    <slot name="content-container"/>
</AppMain>

<style lang="scss">
    @import "@scss/vars";

    .fui-explanation-container {
        background-color: $color-lightsky;
        border-radius: 8px;
        padding: 32px 48px;
        margin-bottom: 128px;

        h2{
            font-size: 1.5rem;
            margin-bottom: 12px;
            font-weight: 500;
        }

    }

</style>
