<script>    
    import AppMain from "../common/AppMain.svelte";
    import {handleClickConnect, isConnected} from "./stores/tf4micro-motion-kit copy";
    
    function handleClickConnect_(){
        handleClickConnect();
    }

    const strAsset = {
        BluetoothTitle : "Bluetooth를 통해 키트 연결",
        bluetoothBtn : "연결"
    }
</script>


<AppMain bannerTitle="FUI(Finger User Interface)" appName="fui">
    <div class="bluetooth-container">
        <p>{strAsset.BluetoothTitle}</p>
        <button class="btn-connect btn-stroke" on:click={handleClickConnect_}>
            <img src="#" alt="블루투스" />
            <span>{strAsset.bluetoothBtn}</span>
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
