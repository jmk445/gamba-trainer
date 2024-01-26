<script>
    import imageSrc from "../../assets/icons/Gamba_HeroBanner.png";

    const strAsset = {
        title: "Gamba Trainer",
        caption: "인공 지능 학습에 필요한 데이터 수집, 학습 과정, 결과 테스트 등을 웹에서 경험할 수 있습니다. 모션, 스피치, 비전 학습을 제공합니다.",
    };
</script>

<div class="banner-container">
    <div class="img-background">
        <img src={imageSrc} alt="hero-img" class="hero-image" />
    </div>
    <div class="banner-contents section">
        <h1 class="banner-title">{strAsset.title}</h1>
        <p>{strAsset.caption}</p>
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
        line-height: 100%;
        margin-bottom: 24px;
    }
</style>
