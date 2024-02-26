<script>    
    import AppMain from "../components/common/AppMain.svelte";
    import {handleClickConnect, isConnected} from "./stores/tf4-micro-motion-kit.js";
    import icBluetooth from "@assets/img/ic_bluetooth_black.svg";
    function handleClickConnect_(){
        handleClickConnect();
    }

    const strAsset = {
        bannerTitle : "MOLE",
        BluetoothTitle : "Bluetooth를 통해 키트 연결",
        bluetoothBtn : "연결"
    }
</script>


<AppMain bannerTitle={strAsset.bannerTitle} appName="mole">
    <div class="bluetooth-container">
        <p>{strAsset.BluetoothTitle}</p>
        <button class="btn-connect btn-stroke" on:click={handleClickConnect_}>
            <img src={icBluetooth} alt="블루투스" />
            <span>{strAsset.bluetoothBtn}</span>
        </button>
    </div>
</AppMain>

<style lang="scss">
    .bluetooth-container {
        text-align: center;

        .btn-connect {
            margin: auto;
            display: flex;
            padding: 10px 36px;
            img{
                margin-right: 12px;
            }
        }
        p {
            font-size: 1.5rem;
            margin-bottom: 28px;
        }
    }
</style>
