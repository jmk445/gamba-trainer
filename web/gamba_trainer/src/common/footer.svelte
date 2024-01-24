<script>
    import { Link } from "svelte-routing";
    import logoPng from "@assets/icons/Secondary Logo_EN_White_RGB.png";

</script>

<div class="footer">
    <div class="footer-container section">
        <div>
            <img src="{logoPng}" alt="gamba logo" />
        </div>
        <!-- <div class="title">
            <p>{title}</p>
        </div> -->
    </div>    
</div>    
<style lang="scss">
        img{
        width: 165px;
    }
    .footer{
        background-color: #293338;
        // height: 234px;
        padding: 53px 0;
    }
    .footer-container{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>

