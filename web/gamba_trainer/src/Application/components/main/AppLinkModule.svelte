<script>
    export let title;
    export let caption;
</script>

<div class="example-contents">
    <div class="img-example">
        <img src="#" alt="이미지">
    </div>
    <div class="example-caption">
        <p>{title}</p>
        <p>{caption}</p>
    </div>
</div>

<style lang="scss">
.example-contents {
    text-align: center;
}
.example-caption p:first-child {
    margin-top: 4px;
    font-size: 1.25rem;
}
.img-example{
    width: 100%;
    height: 254px;
    background-color: #dbdbdb;
}

</style>