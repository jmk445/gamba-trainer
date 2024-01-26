<script>
    export let title;
    export let explanation;

</script>

<div class="description">
    <h1>{title}</h1>
    <p>{explanation}</p>
</div>

<style lang="scss">
    @import "@scss/vars";

    .description{
    padding: 20px 102px;
    background-color: $color-lightsky ;
    border-radius: 8px;
    margin-bottom: 80px;

    h1{
        margin-bottom: 16px;
    }
}

</style>
