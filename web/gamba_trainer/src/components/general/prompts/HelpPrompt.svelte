<script>
    import { onMount } from "svelte";
  import Prompt from "./Prompt.svelte";
  export let onClose = () => {};
  export let pageNum;
  
  onMount(()=> {
    console.log("pageNum : "+ pageNum);
    });
</script>

<Prompt title="Help" closePrompt={onClose}>
  <div class="inner">
    <div class="btn-container">
      <button class="btn-stroke" on:click={()=>pageNum="one"}>사전 설정</button>
      <button class="btn-stroke" on:click={()=>pageNum="two"}>데이터 수집</button>
      <button class="btn-stroke" on:click={()=>pageNum="three"}>모델 학습</button>
      <button class="btn-stroke" on:click={()=>pageNum="four"}>모델 테스트</button>
      <button class="btn-stroke" on:click={()=>pageNum="five"}>변환/전송</button>
    </div>
    <div class="page-container">
      {#if pageNum === "one"}
      <p>사전 설정 내용 어쩌고 저꺼고 이러쿵 저러쿵</p>
      {:else if pageNum === "two"}
      <p>데이터 수집 내용 어쩌고 저꺼고 이러쿵 저러쿵</p>
      {:else if pageNum === "three"}
      <p>모델학습 내용 어쩌고 저꺼고 이러쿵 저러쿵</p>
      {:else if pageNum === "four"}
      <p>모델 테스트 내용 어쩌고 저꺼고 이러쿵 저러쿵</p>
      {:else if pageNum === "five"}
      <p>변환/전송 내용 어쩌고 저꺼고 이러쿵 저러쿵</p>
      {/if}
    </div>
  </div>
</Prompt>

<style lang="scss">
  .inner {
    position: relative;
    // text-align: center;
    z-index: 1;
    max-width: 1132px;
    padding: 18px 92px;
  }
  .page-container{
    padding: 20px;
  }
</style>
