<script>
    import SubBanner from "../../../components/common/SubBanner.svelte";
    import AppSelectNav from "./AppSelectNav.svelte";
    import Footer from "../../../components/common/footer.svelte";
    import icApp from "../../../assets/img/ic_application.svg"
    const strAsset ={
        bannerTitle : "TinyML 예제"
    }
</script>

<header>
    <SubBanner title={strAsset.bannerTitle} icTitle={icApp}/>
</header>
<nav><AppSelectNav /></nav>
<main class="section" aria-live="polite">
    <slot />
</main>
<Footer />
