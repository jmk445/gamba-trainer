<script>
    import { Link } from "svelte-routing";
    import logoPng from "@assets/icons/Symbol_RGB.png";
    export let title;
</script>

<div class="sub-banner">
    <div class="sub-banner-contents section">
        <div>
            <Link to = "/">
            <img src="{logoPng}" alt="gamba logo" />
            </Link>
        </div>
        <div class="title">
            <h1>{title}</h1>
        </div>
    </div>
</div>

<style lang="scss">
    @import "@scss/vars";

    img{
        width: 100px;
    }
    .sub-banner {
        background-color: $color-banner-blue ;
        padding: 26px 0;
        // margin-bottom: 12px;
    }
    .sub-banner-contents {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title{
            font-size: 3rem;
        }
    }
</style>
