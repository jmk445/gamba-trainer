<script>
    import AppLinkModule from "./AppLinkModule.svelte";
    import {Link} from "svelte-routing";
    const strAsset = {
        appOneTitle : "MaskUi",
        appOneCaption : "카메라를 활용한 유저 인터페이스"
    }
</script>

<div class="example-contents-container">
    <Link to="mask-connect">
        <AppLinkModule title={strAsset.appOneTitle} caption={strAsset.appOneCaption} />
    </Link>
    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>
    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>
    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>

    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>
    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>
    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>

    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>
    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>
    <AppLinkModule title="vision app" caption="손가락을 활용한 유저 인터페이스"/>
</div>


<style lang="scss">
    .example-contents-container{
        display: grid;
        grid-template-columns: auto auto auto;
        grid-template-rows: auto auto auto;
        gap: 90px;
        margin-bottom: 133px;
    }
</style>   