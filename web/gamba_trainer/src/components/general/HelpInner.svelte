<script>
    export let exList;
</script>


{#each exList as index}
    <div class="desc-container"> 
        <div class="desc">{index.desc}</div> 
        <div class="img-desc"><img src={index.img} alt="이미지"/></div>
    </div>
{/each}


<style lang="scss">
    .desc-container{
        margin-bottom: 48px;
        .desc{
            margin-bottom: 24px;
        }
        .img-desc{
            // background-color: aqua;
            img{
                width: 100%;
            }
        }
    }
</style>