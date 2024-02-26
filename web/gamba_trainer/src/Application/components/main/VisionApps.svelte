<script>
    import AppList from "./AppLIst.svelte";
    import MaskThumbnail from "@assets/img/tumbnail/maskThumbnail.png"
    const strAsset = [
        {   link : "mask",
            appOneTitle : "MASK",
            appOneCaption : "카메라를 활용한 예제" ,
            tumbnail : MaskThumbnail
        }
    ]
</script>

<AppList appList={strAsset}/>