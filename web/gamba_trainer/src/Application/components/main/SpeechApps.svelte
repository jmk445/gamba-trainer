<script>
    import AppList from "./AppLIst.svelte";
    import MoleThumbnail from "@assets/img/tumbnail/moleThumbnail.png";

    const strAsset = [
        {   link : "mole",
            appOneTitle : "MOLE",
            appOneCaption : "음성을 활용한 두더지 잡기" ,
            tumbnail : MoleThumbnail
        }
    ]
</script>

<AppList appList={strAsset}/>
 