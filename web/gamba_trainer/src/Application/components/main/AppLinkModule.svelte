<script>
    import { createEventDispatcher } from "svelte";

    export let title;
    export let caption;
    
    const dispatch = createEventDispatcher();

    const sendEvent =()=>{
        dispatch("appClick",{value : {title}})
    }
</script>

<div class="example-contents" role="button" on:click={sendEvent}>
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
    display: flex;
    flex-direction: column;
    text-align: center;
    cursor: pointer;
    &:hover{
        filter: brightness(5%);
    }
}
.example-caption {
    flex: 2;
    p:first-child {
        margin-top: 4px;
        font-size: 1.25rem;
    }
    p:last-child {

        font-size: 0.875rem;
    }
}
.img-example{
    width: 100%;
    flex: 8;
    background-color: #dbdbdb;
}

</style>