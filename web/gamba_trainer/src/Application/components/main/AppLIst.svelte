<script>
    import AppLinkModule from "./AppLinkModule.svelte";
    import { Link } from "svelte-routing";

    export let appList;
</script>

<div class="example-contents-container">
    {#each  appList as app}
    <Link to="{app.link}-connect">
        <AppLinkModule title={app.appOneTitle} caption={app.appOneCaption} tumbnail={app.tumbnail}/>
    </Link>
    {/each}
    {#each Array(Math.max(0, 4 - appList.length)) as i}
      <div />
    {/each}
</div>

<style lang="scss">
    .example-contents-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 90px;
        margin-bottom: 132px;
    }
</style>
