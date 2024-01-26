<script>
    import SubBanner from "../../../common/SubBanner.svelte";
    import AppSelectNav from "./AppSelectNav.svelte";
    import Footer from "../../../common/footer.svelte";
</script>

<header>
    <SubBanner title="Application"/>
    <AppSelectNav/>
</header>
<main class="section" aria-live="polite">
    <slot/>
  </main>
  <Footer/>