<script>
    export let title;
    export let caption;
</script>

<div class="training-wrap">
    <h2>{title}</h2>
    <p>{caption}</p>
</div>

<style lang="scss">
    @import "@scss/vars";


    .training-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: $color-lightsky;
        
        width: 100%;
        height: 340px;
        border-radius: 8px;
        &:hover {
            background-color: $color-nav-blue;
            color: white;
        }
    }
    h2 {
        // padding: 50px 0;
        margin-bottom: 14px;
        font-size: 3rem;
    }
</style>
