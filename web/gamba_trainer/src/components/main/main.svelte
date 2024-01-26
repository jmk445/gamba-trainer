<script>
	import { Link } from "svelte-routing";
	import HeroBanner from "./heroBanner.svelte";
	import MainLinkModule from "./mainLinkModule.svelte";
	import Footer from "../../common/footer.svelte";
</script>

<HeroBanner />

<div class="section">
	<div class="training-contents-container">
		<div class="main-link-module">
			<Link to="train-select">
				<MainLinkModule
					title="Trainer"
					caption="인공지능 모델을 학습시킬 수 있습니다."
				/>
			</Link>
		</div>
		<div class="main-link-module">
			<Link to="motionApps-select">
				<MainLinkModule
					title="Application"
					caption="모델을 활용 및 체험할 수 있습니다."
				/>
			</Link>
		</div>
	</div>
</div>
<Footer />

<style lang="scss">
	.training-contents-container {
		display: flex;
		margin: 110px 0;
		justify-content: space-between;
	}
	.main-link-module {
		width: 47%;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
