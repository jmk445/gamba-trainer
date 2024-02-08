<script>
    import { onMount } from "svelte";
    import TrainerCapture from "../../../../components/common/TrainerCapture.svelte";
    import TextInput from "../../../../../components/general/TextInput.svelte";
    import CaptureList from "./CaptureList.svelte";
    import { addLabel, getLabelCnt } from "../../stores/capture/actions";
    // import { labels } from "../../stores/capture/store";
    let newLabelName = "";
    let newLabelError = null;

    // $: if ($labels.includes(newLabelName)) {
    //     newLabelError = strAsset.labelUnique;
    // } else {
    //     newLabelError = "";
    // }

    function handleAddLabel() {
        newLabelError = null;
        if (newLabelName.length > 0) {
            try {
                addLabel(newLabelName);
                newLabelName = "";
            } catch (e) {
                newLabelError = e.toString();
            }
        }
    }

    const strAsset = {
        inputLabel: "고정된 라벨입니다.",
        btnCreate: "생성하기",
    };
</script>

<TrainerCapture>
    <div class="row" slot="capture-label">
        <TextInput
            label={strAsset.inputLabel}
            bind:value={newLabelName}
            onEnter={handleAddLabel}
            errorMessage={newLabelError}
            isdisabled={true}
        />
        <button
            class="btn-stroke primary"
            disabled={true}
            on:click={handleAddLabel}>{strAsset.btnCreate}</button
        >
    </div>
    <div slot="capture-list">
        <CaptureList />
    </div>
</TrainerCapture>

<!-- <style lang="scss">
button {
    margin-left: 1rem;
  }
</style> -->
