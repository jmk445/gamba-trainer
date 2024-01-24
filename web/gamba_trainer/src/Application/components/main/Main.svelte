<script>
    import SubBanner from "../../../common/SubBanner.svelte";
    import AppSelectNav from "./AppSelectNav.svelte";
    import Footer from "../../../common/footer.svelte";
</script>

<header>
    <SubBanner title="Application" />
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
