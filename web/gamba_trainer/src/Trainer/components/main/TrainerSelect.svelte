<script>
    export let trainer;
</script>

<div class="trainer-wrap">
    <p>{trainer}</p>
</div>

<style lang="scss">
    .trainer-wrap {
        background-color: #dbdbdb;
        border-radius: 8px;
        width: 100%;
        padding: 22px 46px;
        cursor: pointer;
        &:hover {
            background-color: #a5a5a5;
        }
    }
    p {
        margin: 0;
        font-size: 2rem;
        text-align: center;
    }
</style>
