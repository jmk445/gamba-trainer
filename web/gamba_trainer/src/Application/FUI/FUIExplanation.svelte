<script>
    import AppMain from "../common/AppMain.svelte";
    // import right from "./asset/"
</script>

<AppMain title="FUI" appName="fui">
    <div class="fui-explanation-container">
        <h2>5가지의 제스처:</h2>
        <ol>
            <li><p>Swipe left</p></li>
            <li><p>Swipe right</p></li>
            <li><p>Twirl (do so quickly!)</p></li>
            <li><p>Pluck (which changes the drum loop)</p></li>
            <li><p>Poke</p></li>
        </ol>
        <div class="img-gesture-container">
            <img src="./asset/left.gif" loading="lazy" alt="left gesture" class="image-6">
            <img src="./asset/right.gif" loading="lazy" alt="right gesture" class="image-7">
            <img src="./asset/twirl.gif" loading="lazy" alt="twirl gesture" class="image-8">
            <img src="./asset/pluck.gif" loading="lazy" alt="pluck gesture" class="image-9">
            <img src="./asset/poke.gif" loading="lazy" alt="poke gesture" class="image-10">
        </div>
        
        <p>
            보드를 손가락 뒤쪽(끝부분에 가까이)에 부착합니다. LED가 사용자를
            향하고 USB 커넥터가 손목을 향하고 있는지 확인합니다.
        </p>
    </div>
</AppMain>

<style lang="scss">
    @import "@scss/vars";

    .fui-explanation-container{
        background-color: $color-lightsky;
        border-radius: 8px;
        padding: 20px 102px;
        ol{
            margin-bottom: 20px;
        }
        
        .img-gesture-container{
            display: flex;
            flex-direction: row;
            gap: 12px;
            margin-bottom: 20px;
            img{
                border-radius: 8px;
                width: 112px;
            }
        }
    }
</style>
