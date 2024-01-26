<script>    
    import AppMain from "../common/AppMain.svelte";
    import {handleClickConnect, isConnected} from "./stores/tf4micro-motion-kit copy";
    
    function handleClickConnect_(){
        handleClickConnect();
    }
</script>


<AppMain title="FUI" appName="fui">
    <div class="bluetooth-container">
        <p>Bluetooth를 통해 키트 연결</p>
        <button class="btn-connect button" on:click={handleClickConnect_}>
            <img src="#" alt="블루투스" />
            <span>Connect</span>
        </button>
    </div>
</AppMain>

<style lang="scss">
    .bluetooth-container {
        text-align: center;

        button {
            margin: auto;
            display: block;
        }
        p {
            font-size: 1.5rem;
            margin-bottom: 28px;
        }
    }
</style>
