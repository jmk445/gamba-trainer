<script>
    import imageSrc from "../../assets/icons/Gamba_HeroBanner.png";
</script>

<div class="banner-container">
    <div class="img-background">
        <img src={imageSrc} alt="hero-img" class="hero-image" />
    </div>
    <div class="banner-contents section">
        <p class="banner-title">Gamba Trainer</p>
        <p>
            인공 지능 학습에 필요한 데이터 수집, 학습 과정, 결과 테스트 등을
            웹에서 경험할 수 있습니다. 모션, 스피치, 비전 학습을 제공합니다.
        </p>
    </div>
</div>

<style lang="scss">
    @import "@scss/vars";

    .banner-container {

        position: relative;

    }
    .banner-contents {
        position: absolute;
        top: 99px;

        p:last-child {
            width: 600px;
        }
    }
    .banner-title {
        font-size: 6rem;
        font-weight: 500;
        line-height: 131px;
        text-align: left;
    }
</style>
