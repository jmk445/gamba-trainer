<script>
    import TextInput from "../../../../general/TextInput.svelte";
    import { addLabel, getLabelCnt } from "../../stores/capture/actions";
    import { labels } from "../../stores/capture/store";
    let newLabelName = "";
    let newLabelError = null;

    $: if ($labels.includes(newLabelName)) {
        newLabelError = strAsset.labelUnique;
    } else {
        newLabelError = "";
    }

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
        inputLabel : "라벨의 이름을 입력하세요",
        btnCreate : "생성하기",
        labelUnique : "똑같은 이름의 라벨이 있습니다."
    }
</script>

<TextInput
    label={strAsset.inputLabel}
    bind:value={newLabelName}
    onEnter={handleAddLabel}
    errorMessage={newLabelError}
/>
<button
    class="btn-stroke primary"
    disabled={newLabelName.length === 0 || newLabelError}
    on:click={handleAddLabel}>{strAsset.btnCreate}</button
>


<style lang="scss">

    button {
      margin-left: 1rem;
    }

</style>