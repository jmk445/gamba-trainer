<script>
    import TextInput from "../../../../general/TextInput.svelte";
    import { addLabel, getLabelCnt } from "../../stores/capture/actions";
    import { labels } from "../../stores/capture/store";
    let newLabelName = "";
    let newLabelError = null;

    $: if ($labels.includes(newLabelName)) {
        newLabelError = "Label must be unique";
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
</script>

<TextInput
    label="라벨의 이름을 입력하세요"
    bind:value={newLabelName}
    onEnter={handleAddLabel}
    errorMessage={newLabelError}
/>
<button
    class="button primary"
    disabled={newLabelName.length === 0 || newLabelError}
    on:click={handleAddLabel}>Create new</button
>


<style lang="scss">

    button {
      margin-left: 1rem;
    }

</style>