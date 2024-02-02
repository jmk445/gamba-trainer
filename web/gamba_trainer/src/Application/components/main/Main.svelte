<script>
    import SubBanner from "../../../components/common/SubBanner.svelte";
    import AppSelectNav from "./AppSelectNav.svelte";
    import Footer from "../../../components/common/footer.svelte";
    const strAsset ={
        bannerTitle : "TinyML 예제"
    }
</script>

<header>
    <SubBanner title={strAsset.bannerTitle} />
</header>
<nav><AppSelectNav /></nav>
<main class="section" aria-live="polite">
    <slot />
</main>
<Footer />

<style lang="scss">
    nav {
        position: sticky;
        top: 10px;
        z-index: 1;
    }
</style>
