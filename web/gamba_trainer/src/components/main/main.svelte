<script>
	import { Link } from "svelte-routing";
	import HeroBanner from "./heroBanner.svelte";
	import MainLinkModule from "./mainLinkModule.svelte";
	import Footer from "../../common/footer.svelte";

	const strAsset = {
		modeOneTitle : "트레이너",
		modeOneCaption : "인공지능 모델을 학습시킬 수 있습니다.",
		modeTwoTitle : "TInyML 예제",
		modeTwoCaption : "모델을 활용 및 체험할 수 있습니다."
	}
</script>

<HeroBanner />

<div class="section">
	<div class="contents">
		<div class="main-link-module">
			<Link to="train-select">
				<MainLinkModule
					title={strAsset.modeOneTitle}
					caption={strAsset.modeOneCaption}
				/>
			</Link>
		</div>
		<div class="main-link-module">
			<Link to="motionApps-select">
				<MainLinkModule
					title={strAsset.modeTwoTitle}
					caption={strAsset.modeTwoCaption}
				/>
			</Link>
		</div>
	</div>
</div>
<Footer />

<style lang="scss">
	.contents {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.main-link-module {
		width: 47%;
	}
	.contents{
		margin: 128px 0;
	}
	// @media (min-width: 640px) {
	// 	main {
	// 		max-width: none;
	// 	}
	// }
</style>
