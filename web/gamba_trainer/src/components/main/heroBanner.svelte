<script>
    import imageSrc from "../../assets/img/banner_hero.svg";

    const strAsset = {
        title: "Gamba Trainer",
        caption: "인공 지능 학습에 필요한 데이터 수집, 학습 과정, 결과 테스트 등을 웹에서 경험할 수 있습니다. 모션, 스피치, 비전 학습을 제공합니다.",
    };
</script>

<div class="banner-container">
    <img src={imageSrc} alt="hero-img" class="hero-image" />
    <div class="banner-contents section">
        <h1 class="banner-title">{strAsset.title}</h1>
        <p>{strAsset.caption}</p>
    </div>
</div>

<style lang="scss">
    @import "@scss/vars";

    .banner-container {
        position: relative;
        height: 400px;
        overflow: hidden;
        img{
            width: 100%;
            // min-width: none;
        }
    }
    .banner-contents {
        position: absolute;
        top: 50%;
        width: 80%;
        transform: translate(0, -50%);

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
