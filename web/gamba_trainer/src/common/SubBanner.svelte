<script>
    import { Link } from "svelte-routing";
    import logoPng from "@assets/icons/Symbol_RGB.png";
    import { exp } from "@tensorflow/tfjs";
    export let titleIcon;
    export let title;
    export let altTxt;
</script>

<div class="sub-banner">
    <div class="sub-banner-contents section">
        <div>
            <Link to="/">
                <img class="logo-icon" src={logoPng} alt="gamba logo" />
            </Link>
        </div>
        <div class="title">
            <img class="title-icon" src={titleIcon} alt={altTxt} />
            <h1>{title}</h1>
        </div>
    </div>
</div>

<style lang="scss">
    @import "@scss/vars";

    .logo-icon {
        width: 100px;
    }
    .sub-banner {
        background-color: $color-banner-blue;
        padding: 26px 0;
        // margin-bottom: 12px;
    }
    .sub-banner-contents {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
            display: flex;
            align-items: center;
            h1 {
                display: inline-block;
                font-weight: 500;
                font-size: 3rem;
            }

            .title-icon {
                width: 60px;
                margin-right: 16px;
            }
        }
    }
</style>
