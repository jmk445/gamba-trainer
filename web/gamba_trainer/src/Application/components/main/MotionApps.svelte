<script>
    import FuiThumbnail from "../../../assets/img/tumbnail/fuiThumbnail.png";
    import AppList from "./AppLIst.svelte";
    const strAsset = [
        {   link : "fui",
            appOneTitle : "FUI",
            appOneCaption : "손가락을 활용한 유저 인터페이스" ,
            tumbnail : FuiThumbnail
        }
    ]
</script>

<AppList appList={strAsset}/>